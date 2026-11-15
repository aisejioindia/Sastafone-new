"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminManagePartnerClaim = exports.onAuthUserCreate = exports.syncUserRoleClaims = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const functionsV1 = __importStar(require("firebase-functions/v1"));
(0, app_1.initializeApp)();
const adminAuth = (0, auth_1.getAuth)();
const adminDb = (0, firestore_1.getFirestore)();
/**
 * Parse ADMIN_EMAILS environment variable (case-insensitive, comma-separated)
 */
function getAdminAllowlist() {
    const raw = process.env.ADMIN_EMAILS || '';
    return raw
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0);
}
/**
 * Core helper: evaluates Auth user provider + verified email + ADMIN_EMAILS + partners collection
 * and atomically updates custom claims, removing admin=true if no longer allowed.
 */
async function syncClaimsForUid(uid, reason) {
    const userRecord = await adminAuth.getUser(uid);
    const normalizedEmail = (userRecord.email || '').trim().toLowerCase();
    const emailVerified = userRecord.emailVerified === true;
    const hasGoogleProvider = userRecord.providerData.some((provider) => provider.providerId === 'google.com');
    const allowlist = getAdminAllowlist();
    const isVerifiedAdminEmail = Boolean(normalizedEmail) &&
        emailVerified &&
        hasGoogleProvider &&
        allowlist.includes(normalizedEmail);
    const existingClaims = (userRecord.customClaims || {});
    let nextRole = 'customer';
    let nextAdmin = false;
    let nextPartner = false;
    let nextPartnerId = null;
    if (isVerifiedAdminEmail) {
        nextRole = 'admin';
        nextAdmin = true;
    }
    else if (emailVerified && normalizedEmail) {
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
        }
        else {
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
                await partnerByEmailSnap.docs[0].ref.set({ uid, email: normalizedEmail, updatedAt: new Date().toISOString() }, { merge: true });
            }
        }
    }
    const prevAdmin = existingClaims.admin === true;
    const prevPartner = existingClaims.partner === true;
    const prevRole = existingClaims.role || 'customer';
    const prevPartnerId = existingClaims.partnerId || null;
    const claimsChanged = prevAdmin !== nextAdmin ||
        prevPartner !== nextPartner ||
        prevRole !== nextRole ||
        prevPartnerId !== nextPartnerId;
    const updatedClaims = {
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
        .set({
        uid,
        email: normalizedEmail || userRecord.email || '',
        role: nextRole,
        partnerId: nextPartnerId || null,
        updatedAt: new Date().toISOString(),
        timestamp: firestore_1.FieldValue.serverTimestamp()
    }, { merge: true });
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
            timestamp: firestore_1.FieldValue.serverTimestamp()
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
exports.syncUserRoleClaims = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication is required.');
    }
    const uid = request.auth.uid;
    const reason = typeof request.data?.reason === 'string' && request.data.reason.trim()
        ? request.data.reason.trim().slice(0, 80)
        : 'client_signin_sync';
    return syncClaimsForUid(uid, reason);
});
/**
 * Auth onCreate trigger so newly registered users get default/allowlisted claims immediately.
 */
exports.onAuthUserCreate = functionsV1.auth.user().onCreate(async (user) => {
    if (!user?.uid)
        return;
    try {
        await syncClaimsForUid(user.uid, 'auth_user_created');
    }
    catch (err) {
        console.error('onAuthUserCreate sync error:', err);
    }
});
/**
 * Admin-only callable to link/sync or revoke a Partner custom claim when managing partners.
 */
exports.adminManagePartnerClaim = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth ||
        request.auth.token.admin !== true ||
        request.auth.token.email_verified !== true) {
        throw new https_1.HttpsError('permission-denied', 'Only verified admin accounts can manage partner access.');
    }
    const email = typeof request.data?.email === 'string' ? request.data.email.trim().toLowerCase() : '';
    const partnerId = typeof request.data?.partnerId === 'string' ? request.data.partnerId.trim() : '';
    if (!email) {
        return { synced: false, message: 'No email provided for claim sync.' };
    }
    try {
        const targetUser = await adminAuth.getUserByEmail(email);
        const result = await syncClaimsForUid(targetUser.uid, `admin_partner_sync:${partnerId || 'partner'}`);
        return { synced: true, ...result };
    }
    catch (err) {
        if (err?.code === 'auth/user-not-found') {
            return {
                synced: false,
                message: 'Partner email has not signed in yet; claim will apply automatically on first verified login.'
            };
        }
        throw new https_1.HttpsError('internal', err?.message || 'Failed to sync partner claim.');
    }
});
//# sourceMappingURL=index.js.map