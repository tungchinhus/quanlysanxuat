const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function để admin đổi mật khẩu của user
 * POST /api/admin/change-password
 */
exports.changeUserPassword = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { userId, newPassword, adminUserId } = req.body;

    // Validate input
    if (!userId || !newPassword || !adminUserId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, newPassword, adminUserId'
      });
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Check if admin has permission
    const adminDoc = await admin.firestore().collection('users').doc(adminUserId).get();
    if (!adminDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
      return;
    }

    const adminData = adminDoc.data();
    const adminRoles = adminData.roles || [];
    const isAdmin = adminRoles.some(role => 
      role.toLowerCase().includes('admin') || 
      role.toLowerCase().includes('manager')
    );

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Admin role required.'
      });
      return;
    }

    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userData = userDoc.data();
    const firebaseUID = userData.uid;

    if (!firebaseUID) {
      res.status(400).json({
        success: false,
        message: 'User does not have Firebase UID. Cannot change password.'
      });
      return;
    }

    // Change password using Firebase Admin SDK
    await admin.auth().updateUser(firebaseUID, {
      password: newPassword
    });

    // Log the action
    await admin.firestore().collection('admin_actions').add({
      action: 'change_password',
      adminUserId: adminUserId,
      targetUserId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        adminEmail: adminData.email,
        targetUserEmail: userData.email
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Cloud Function để kiểm tra quyền admin
 * GET /api/admin/check-permission/{adminUserId}
 */
exports.checkAdminPermission = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const adminUserId = req.params.adminUserId;

    if (!adminUserId) {
      res.status(400).json({
        success: false,
        message: 'Admin user ID is required'
      });
      return;
    }

    // Check if admin has permission
    const adminDoc = await admin.firestore().collection('users').doc(adminUserId).get();
    if (!adminDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
      return;
    }

    const adminData = adminDoc.data();
    const adminRoles = adminData.roles || [];
    const isAdmin = adminRoles.some(role => 
      role.toLowerCase().includes('admin') || 
      role.toLowerCase().includes('manager')
    );

    res.status(200).json({
      success: true,
      hasPermission: isAdmin,
      roles: adminRoles
    });

  } catch (error) {
    console.error('Error checking admin permission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});
