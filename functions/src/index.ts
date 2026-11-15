import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as functionsV1 from 'firebase-functions/v1';

initializeApp();

const adminAuth = getAuth();
const adminDb = getFirestore();

/**
 * Parse ADMIN_EMAILS environment variable (case-insensitive, comma-separated)
 */
function getAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

interface SyncClaimsResult {
  role: 'admin' | 'partner' | 'customer';
  admin: boolean;
  partner: boolean;
  partnerId: string | null;
  email: string;
  emailVerified: boolean;
  claimsChanged: boolean;
}

/**
 * Core helper: evaluates Auth user provider + verified email + ADMIN_EMAILS + partners collection
 * and atomically updates custom claims, removing admin=true if no longer allowed.
 */
async function syncClaimsForUid(uid: string, reason: string): Promise<SyncClaimsResult> {
  const userRecord = await adminAuth.getUser(uid);
  const normalizedEmail = (userRecord.email || '').trim().toLowerCase();
  const emailVerified = userRecord.emailVerified === true;
  const hasGoogleProvider = userRecord.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );

  const allowlist = getAdminAllowlist();
  const isVerifiedAdminEmail =
    Boolean(normalizedEmail) &&
    emailVerified &&
    hasGoogleProvider &&
    allowlist.includes(normalizedEmail);

  const existingClaims = (userRecord.customClaims || {}) as Record<string, unknown>;
  let nextRole: 'admin' | 'partner' | 'customer' = 'customer';
  let nextAdmin = false;
  let nextPartner = false;
  let nextPartnerId: string | null = null;

  if (isVerifiedAdminEmail) {
    nextRole = 'admin';
    nextAdmin = true;
  } else if (emailVerified && normalizedEmail) {
    // Check if user is an active partner matched by uid or verified email
    const partnerByUidSnap = await adminDb
      .collection('partners')
      .where('uid', '==', uid)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (!partnerByUidSnap.empty) {
      nextRole = 'partner';
      nextPartner = true;
      nextPartnerId = partnerByUidSnap.docs[0].id;
    } else {
      const partnerByEmailSnap = await adminDb
        .collection('partners')
        .where('email', '==', normalizedEmail)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (!partnerByEmailSnap.empty) {
        nextRole = 'partner';
        nextPartner = true;
        nextPartnerId = partnerByEmailSnap.docs[0].id;
        // Link uid back onto partner doc for fast lookup
        await partnerByEmailSnap.docs[0].ref.set(
          { uid, email: normalizedEmail, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }
    }
  }

  const prevAdmin = existingClaims.admin === true;
  const prevPartner = existingClaims.partner === true;
  const prevRole = existingClaims.role || 'customer';
  const prevPartnerId = (existingClaims.partnerId as string | null | undefined) || null;

  const claimsChanged =
    prevAdmin !== nextAdmin ||
    prevPartner !== nextPartner ||
    prevRole !== nextRole ||
    prevPartnerId !== nextPartnerId;

  const updatedClaims: Record<string, unknown> = {
    ...existingClaims,
    role: nextRole,
    admin: nextAdmin,
    partner: nextPartner,
    partnerId: nextPartnerId
  };

  if (!nextAdmin) {
    delete updatedClaims.admin;
  }
  if (!nextPartner) {
    delete updatedClaims.partner;
    delete updatedClaims.partnerId;
  }

  if (claimsChanged) {
    await adminAuth.setCustomUserClaims(uid, updatedClaims);
  }

  // Mirror verified role cleanly into users/{uid}
  await adminDb
    .collection('users')
    .doc(uid)
    .set(
      {
        uid,
        email: normalizedEmail || userRecord.email || '',
        role: nextRole,
        partnerId: nextPartnerId || null,
        updatedAt: new Date().toISOString(),
        timestamp: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

  // Record audit log for privileged sign-ins or role changes
  if (claimsChanged || nextAdmin || nextPartner) {
    await adminDb.collection('auditLogs').add({
      action: claimsChanged ? 'role_claims_updated' : 'privileged_signin',
      actorUid: uid,
      actorEmail: normalizedEmail,
      actorRole: nextRole,
      targetType: 'auth_user',
      targetId: uid,
      reason,
      before: {
        role: prevRole,
        admin: prevAdmin,
        partner: prevPartner,
        partnerId: prevPartnerId
      },
      after: {
        role: nextRole,
        admin: nextAdmin,
        partner: nextPartner,
        partnerId: nextPartnerId
      },
      createdAt: new Date().toISOString(),
      timestamp: FieldValue.serverTimestamp()
    });
  }

  return {
    role: nextRole,
    admin: nextAdmin,
    partner: nextPartner,
    partnerId: nextPartnerId,
    email: normalizedEmail,
    emailVerified,
    claimsChanged
  };
}

/**
 * HTTPS Callable called on sign-in / token refresh by client app.
 * Verifies Google sign-in + email_verified against process.env.ADMIN_EMAILS,
 * sets or revokes admin=true claim, and syncs partner claims.
 */
export const syncUserRoleClaims = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }
  const uid = request.auth.uid;
  const reason =
    typeof request.data?.reason === 'string' && request.data.reason.trim()
      ? request.data.reason.trim().slice(0, 80)
      : 'client_signin_sync';

  return syncClaimsForUid(uid, reason);
});

/**
 * Auth onCreate trigger so newly registered users get default/allowlisted claims immediately.
 */
export const onAuthUserCreate = functionsV1.auth.user().onCreate(async (user) => {
  if (!user?.uid) return;
  try {
    await syncClaimsForUid(user.uid, 'auth_user_created');
  } catch (err) {
    console.error('onAuthUserCreate sync error:', err);
  }
});

/**
 * Admin-only callable to link/sync or revoke a Partner custom claim when managing partners.
 */
export const adminManagePartnerClaim = onCall({ cors: true }, async (request) => {
  if (
    !request.auth ||
    request.auth.token.admin !== true ||
    request.auth.token.email_verified !== true
  ) {
    throw new HttpsError(
      'permission-denied',
      'Only verified admin accounts can manage partner access.'
    );
  }

  const email = typeof request.data?.email === 'string' ? request.data.email.trim().toLowerCase() : '';
  const partnerId = typeof request.data?.partnerId === 'string' ? request.data.partnerId.trim() : '';

  if (!email) {
    return { synced: false, message: 'No email provided for claim sync.' };
  }

  try {
    const targetUser = await adminAuth.getUserByEmail(email);
    const result = await syncClaimsForUid(
      targetUser.uid,
      `admin_partner_sync:${partnerId || 'partner'}`
    );
    return { synced: true, ...result };
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      return {
        synced: false,
        message: 'Partner email has not signed in yet; claim will apply automatically on first verified login.'
      };
    }
    throw new HttpsError('internal', err?.message || 'Failed to sync partner claim.');
  }
});
