const { ForgeXSolanaSDK } = require('../');

async function dialectExample() {
  try {
    // Initialize SDK with Dialect configuration
    const sdk = new ForgeXSolanaSDK({
      apiKeys: {
        dialect: {
          environment: 'production' // or 'development'
        }
      }
    });

    console.log('💬 ForgeX Dialect Integration Example\n');

    const walletPublicKey = '11111111111111111111111111111112'; // Example wallet
    
    // Get notifications for a wallet
    console.log('Getting notifications...');
    try {
      const notifications = await sdk.dialect.getNotifications(walletPublicKey);
      console.log('Notification count:', notifications.length);
      
      if (notifications.length > 0) {
        console.log('Latest notification:', {
          id: notifications[0].id,
          title: notifications[0].title,
          body: notifications[0].body,
          timestamp: notifications[0].timestamp,
          type: notifications[0].type
        });
      } else {
        console.log('No notifications found for this wallet');
      }
    } catch (error) {
      console.log('Notifications not available:', error.message);
    }

    // Get wallet subscriptions
    console.log('\nGetting wallet subscriptions...');
    try {
      const subscriptions = await sdk.dialect.getSubscriptions(walletPublicKey);
      console.log('Subscription count:', subscriptions.length);
      
      if (subscriptions.length > 0) {
        console.log('First subscription:', {
          id: subscriptions[0].id,
          type: subscriptions[0].type,
          config: subscriptions[0].config,
          enabled: subscriptions[0].enabled
        });
      } else {
        console.log('No subscriptions found for this wallet');
      }
    } catch (error) {
      console.log('Subscriptions not available:', error.message);
    }

    // Get available notification types
    console.log('\nGetting available notification types...');
    try {
      const notificationTypes = await sdk.dialect.getNotificationTypes();
      console.log('Available notification types:', notificationTypes.length);
      
      if (notificationTypes.length > 0) {
        console.log('Notification types:', notificationTypes.map(type => ({
          id: type.id,
          name: type.name,
          description: type.description
        })));
      }
    } catch (error) {
      console.log('Notification types not available:', error.message);
    }

    // Subscribe to notifications (example)
    console.log('\nExample subscription creation...');
    try {
      const subscriptionData = {
        walletPublicKey: walletPublicKey,
        notificationType: 'price-alerts',
        config: {
          threshold: 100,
          direction: 'above'
        }
      };
      
      console.log('Subscription data:', subscriptionData);
      
      // Uncomment to actually create subscription (requires proper setup)
      // const subscription = await sdk.dialect.subscribe(subscriptionData);
      // console.log('Created subscription:', subscription);
      
      console.log('Subscription simulation completed (not executed)');
    } catch (error) {
      console.log('Subscription creation failed:', error.message);
    }

    // Send notification (example for dApp developers)
    console.log('\nExample notification sending...');
    try {
      const notificationData = {
        recipients: [walletPublicKey],
        title: 'Test Notification',
        body: 'This is a test notification from ForgeX SDK',
        type: 'info'
      };
      
      console.log('Notification data:', notificationData);
      
      // Uncomment to actually send notification (requires proper setup and permissions)
      // const result = await sdk.dialect.sendNotification(notificationData);
      // console.log('Notification sent:', result);
      
      console.log('Notification simulation completed (not executed)');
    } catch (error) {
      console.log('Notification sending failed:', error.message);
    }

    console.log('\n✅ Dialect example completed successfully!');
    console.log('\n📝 Note: This example demonstrates Dialect integration patterns.');
    console.log('   Real usage requires:');
    console.log('   1. Proper wallet setup and permissions');
    console.log('   2. Valid notification type configurations');
    console.log('   3. dApp registration for sending notifications');

  } catch (error) {
    console.error('❌ Error in Dialect example:', error.message);
  }
}

// Run the example
if (require.main === module) {
  dialectExample();
}

module.exports = dialectExample;