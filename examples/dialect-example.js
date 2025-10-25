const { ForgexSDK } = require("../dist/index.js");

class DialectExample {
  constructor(apiKey) {
    this.sdk = new ForgexSDK({ dialect: { apiKey } });
    this.isWalletConnected = false;
  }

  // Connect wallet for messaging operations
  async connectWallet(wallet) {
    try {
      this.sdk = new ForgexSDK({
        dialect: { apiKey: this.sdk.dialect.apiKey },
        wallet,
      });
      this.isWalletConnected = true;
      console.log("✅ Wallet connected for Dialect operations");
    } catch (error) {
      console.error("Failed to connect wallet:", error.message);
    }
  }

  // ================== NOTIFICATION SYSTEM ==================
  async demonstrateNotificationSystem() {
    console.log("\n🔔 DIALECT NOTIFICATION SYSTEM");
    console.log("=".repeat(50));

    try {
      // Notification management
      console.log("\n📬 Notification Management:");

      const notificationTypes = [
        {
          type: "price_alert",
          name: "Price Alerts",
          description: "Get notified when token prices hit your targets",
          example: "SOL reaches $150",
        },
        {
          type: "portfolio_update",
          name: "Portfolio Updates",
          description: "Track changes in your DeFi positions",
          example: "Your staking rewards are ready to claim",
        },
        {
          type: "governance",
          name: "Governance Alerts",
          description: "Stay informed about DAO proposals and voting",
          example: "New proposal requires your vote",
        },
        {
          type: "security",
          name: "Security Alerts",
          description: "Important security notifications for your wallet",
          example: "Suspicious transaction detected",
        },
        {
          type: "defi_update",
          name: "DeFi Updates",
          description: "Protocol updates and yield opportunities",
          example: "New high-yield farming pool available",
        },
      ];

      console.log("Available Notification Types:");
      notificationTypes.forEach((type, index) => {
        console.log(`${index + 1}. ${type.name}`);
        console.log(`   Description: ${type.description}`);
        console.log(`   Example: "${type.example}"`);
        console.log("");
      });

      if (this.isWalletConnected) {
        // Subscribe to notifications
        console.log("\n✅ Subscribing to Notifications:");
        for (const type of notificationTypes.slice(0, 3)) {
          const subscription = await this.sdk.dialect.subscribe({
            type: type.type,
            enabled: true,
            preferences: {
              email: true,
              push: true,
              sms: false,
            },
          });
          console.log(
            `Subscribed to ${type.name}: ${
              subscription?.success ? "Success" : "Failed"
            }`
          );
        }
      } else {
        console.log(
          "ℹ️ Wallet connection required for notification subscriptions"
        );
      }
    } catch (error) {
      console.error("Notification system error:", error.message);
    }
  }

  // ================== MESSAGING PLATFORM ==================
  async demonstrateMessagingPlatform() {
    console.log("\n💬 MESSAGING PLATFORM");
    console.log("=".repeat(50));

    try {
      // Direct messaging features
      console.log("\n📱 Direct Messaging Features:");

      const messagingFeatures = [
        {
          feature: "Wallet-to-Wallet Messaging",
          description:
            "Send secure messages directly to other wallet addresses",
          useCase: "Coordinate with trading partners",
        },
        {
          feature: "Group Chats",
          description:
            "Create and join DAO or protocol-specific discussion groups",
          useCase: "Participate in governance discussions",
        },
        {
          feature: "Broadcast Channels",
          description: "Subscribe to updates from protocols and influencers",
          useCase: "Get alpha from top traders",
        },
        {
          feature: "Encrypted Messaging",
          description:
            "End-to-end encrypted communication for sensitive topics",
          useCase: "Private deal negotiations",
        },
        {
          feature: "Transaction Context",
          description: "Add context and notes to on-chain transactions",
          useCase: "Explain payment reasons",
        },
      ];

      messagingFeatures.forEach((feature, index) => {
        console.log(`${index + 1}. ${feature.feature}`);
        console.log(`   Description: ${feature.description}`);
        console.log(`   Use Case: ${feature.useCase}`);
        console.log("");
      });

      // Message types
      console.log("\n📝 Message Types:");
      const messageTypes = [
        { type: "text", icon: "💬", description: "Plain text messages" },
        {
          type: "transaction",
          icon: "💸",
          description: "Transaction-linked messages",
        },
        { type: "nft", icon: "🖼️", description: "NFT sharing and discussion" },
        { type: "token", icon: "🪙", description: "Token price and analysis" },
        { type: "poll", icon: "📊", description: "Community polls and voting" },
        { type: "alert", icon: "🚨", description: "Important announcements" },
      ];

      messageTypes.forEach((type) => {
        console.log(`${type.icon} ${type.type}: ${type.description}`);
      });

      if (this.isWalletConnected) {
        // Send sample message
        console.log("\n📤 Sending Sample Message:");
        const message = await this.sdk.dialect.sendMessage({
          to: "11111111111111111111111111111112", // Example recipient
          type: "text",
          content: "Hello from ForgeX SDK! 👋",
          metadata: {
            priority: "normal",
            encrypted: false,
          },
        });
        console.log(`Message sent: ${message?.messageId || "Success"}`);
      }
    } catch (error) {
      console.error("Messaging platform error:", error.message);
    }
  }

  // ================== COMMUNITY FEATURES ==================
  async demonstrateCommunityFeatures() {
    console.log("\n👥 COMMUNITY FEATURES");
    console.log("=".repeat(50));

    try {
      // Community channels
      console.log("\n🌐 Community Channels:");

      const communityChannels = [
        {
          name: "Solana DeFi Alpha",
          type: "public",
          members: 15420,
          description: "Latest DeFi opportunities and yield farming strategies",
          topics: ["Yield Farming", "Lending", "DEX Trading"],
        },
        {
          name: "NFT Collectors",
          type: "public",
          members: 8930,
          description:
            "NFT drops, marketplace analysis, and collection discussions",
          topics: ["NFT Drops", "Market Analysis", "Art Discussion"],
        },
        {
          name: "DAO Governance Hub",
          type: "public",
          members: 12650,
          description: "Cross-DAO governance discussions and proposal analysis",
          topics: ["Proposals", "Voting", "Governance"],
        },
        {
          name: "Dev Community",
          type: "verified",
          members: 3420,
          description:
            "Solana developers sharing code, tools, and best practices",
          topics: ["Development", "Tools", "Best Practices"],
        },
        {
          name: "Whale Watchers",
          type: "premium",
          members: 892,
          description: "Track large transactions and wallet movements",
          topics: ["Whale Tracking", "Market Moving Trades", "Analytics"],
        },
      ];

      communityChannels.forEach((channel, index) => {
        const typeIcon =
          channel.type === "premium"
            ? "💎"
            : channel.type === "verified"
            ? "✅"
            : "🌐";
        console.log(`${index + 1}. ${typeIcon} ${channel.name}`);
        console.log(`   Members: ${channel.members.toLocaleString()}`);
        console.log(`   Description: ${channel.description}`);
        console.log(`   Topics: ${channel.topics.join(", ")}`);
        console.log("");
      });

      // Reputation system
      console.log("\n⭐ Reputation System:");
      const reputationLevels = [
        {
          level: "Newcomer",
          range: "0-100",
          perks: ["Basic messaging", "Public channels"],
        },
        {
          level: "Contributor",
          range: "101-500",
          perks: ["Channel creation", "Custom emojis"],
        },
        {
          level: "Veteran",
          range: "501-1000",
          perks: ["Priority support", "Beta features"],
        },
        {
          level: "Expert",
          range: "1001-2500",
          perks: ["Verified badge", "Expert channels"],
        },
        {
          level: "Legend",
          range: "2500+",
          perks: ["Premium features", "Influence network"],
        },
      ];

      reputationLevels.forEach((level, index) => {
        console.log(`${index + 1}. ${level.level} (${level.range} points)`);
        console.log(`   Perks: ${level.perks.join(", ")}`);
        console.log("");
      });
    } catch (error) {
      console.error("Community features error:", error.message);
    }
  }

  // ================== INTEGRATION FEATURES ==================
  async demonstrateIntegrationFeatures() {
    console.log("\n🔗 INTEGRATION FEATURES");
    console.log("=".repeat(50));

    try {
      // Protocol integrations
      console.log("\n🏛️ Protocol Integrations:");

      const protocolIntegrations = [
        {
          protocol: "Jupiter",
          integration: "Trade notifications",
          description:
            "Get notified about swap opportunities and price movements",
        },
        {
          protocol: "MarginFi",
          integration: "Lending alerts",
          description: "Track your lending positions and liquidation risks",
        },
        {
          protocol: "Meteora",
          integration: "Yield updates",
          description: "Monitor your LP positions and yield farming rewards",
        },
        {
          protocol: "Magic Eden",
          integration: "NFT alerts",
          description: "Get notified about NFT sales, offers, and new listings",
        },
        {
          protocol: "Raydium",
          integration: "Pool updates",
          description: "Track liquidity pool performance and new opportunities",
        },
      ];

      protocolIntegrations.forEach((integration, index) => {
        console.log(`${index + 1}. ${integration.protocol}`);
        console.log(`   Integration: ${integration.integration}`);
        console.log(`   Description: ${integration.description}`);
        console.log("");
      });

      // API webhooks
      console.log("\n📡 API Webhooks:");
      const webhookTypes = [
        {
          event: "message_received",
          description: "Triggered when you receive a new message",
          payload: {
            sender: "wallet_address",
            content: "message_text",
            timestamp: "unix_timestamp",
          },
        },
        {
          event: "notification_sent",
          description: "Triggered when a notification is sent to you",
          payload: {
            type: "alert_type",
            title: "notification_title",
            priority: "high|medium|low",
          },
        },
        {
          event: "channel_invite",
          description: "Triggered when you're invited to a channel",
          payload: {
            channel: "channel_id",
            inviter: "wallet_address",
            permissions: "role_permissions",
          },
        },
      ];

      console.log("Available Webhook Events:");
      webhookTypes.forEach((webhook, index) => {
        console.log(`${index + 1}. ${webhook.event}`);
        console.log(`   Description: ${webhook.description}`);
        console.log(
          `   Sample Payload: ${JSON.stringify(webhook.payload, null, 4)}`
        );
        console.log("");
      });
    } catch (error) {
      console.error("Integration features error:", error.message);
    }
  }

  // ================== ANALYTICS & INSIGHTS ==================
  async demonstrateAnalyticsInsights() {
    console.log("\n📊 ANALYTICS & INSIGHTS");
    console.log("=".repeat(50));

    try {
      // Communication analytics
      console.log("\n📈 Communication Analytics:");

      if (this.isWalletConnected) {
        const analytics = await this.sdk.dialect.getAnalytics();
        console.log("Your Communication Stats:");
        console.log(`Messages Sent: ${analytics?.messagesSent || "N/A"}`);
        console.log(
          `Messages Received: ${analytics?.messagesReceived || "N/A"}`
        );
        console.log(`Channels Joined: ${analytics?.channelsJoined || "N/A"}`);
        console.log(
          `Notifications Enabled: ${analytics?.notificationsEnabled || "N/A"}`
        );
        console.log(`Reputation Score: ${analytics?.reputationScore || "N/A"}`);
      } else {
        console.log("Sample Communication Analytics:");
        console.log("Messages Sent: 1,247");
        console.log("Messages Received: 3,891");
        console.log("Channels Joined: 23");
        console.log("Notifications Enabled: 12");
        console.log("Reputation Score: 1,356");
      }

      // Network insights
      console.log("\n🌐 Network Insights:");
      const networkStats = {
        totalUsers: 145000,
        activeChannels: 2340,
        messagesPerDay: 890000,
        topChannels: [
          { name: "Solana General", messages: 15420 },
          { name: "DeFi Alpha", messages: 12680 },
          { name: "NFT Trading", messages: 9870 },
        ],
      };

      console.log(
        `Total Network Users: ${networkStats.totalUsers.toLocaleString()}`
      );
      console.log(
        `Active Channels: ${networkStats.activeChannels.toLocaleString()}`
      );
      console.log(
        `Messages Per Day: ${networkStats.messagesPerDay.toLocaleString()}`
      );
      console.log("\nMost Active Channels:");
      networkStats.topChannels.forEach((channel, index) => {
        console.log(
          `${index + 1}. ${
            channel.name
          }: ${channel.messages.toLocaleString()} messages/day`
        );
      });

      // Engagement metrics
      console.log("\n💬 Engagement Metrics:");
      const engagementMetrics = {
        responseRate: 78,
        averageResponseTime: "4.2 minutes",
        channelGrowth: "+15%",
        userRetention: "89%",
      };

      console.log(`Average Response Rate: ${engagementMetrics.responseRate}%`);
      console.log(
        `Average Response Time: ${engagementMetrics.averageResponseTime}`
      );
      console.log(`Channel Growth (30d): ${engagementMetrics.channelGrowth}`);
      console.log(`User Retention: ${engagementMetrics.userRetention}`);
    } catch (error) {
      console.error("Analytics insights error:", error.message);
    }
  }

  // ================== WALLET OPERATIONS ==================
  async demonstrateWalletOperations(walletPublicKey) {
    console.log("\n👛 WALLET OPERATIONS");
    console.log("=".repeat(50));

    try {
      // Get wallet notifications
      console.log("\n📬 Getting wallet notifications...");
      try {
        const notifications = await this.sdk.dialect.getNotifications(
          walletPublicKey
        );
        console.log("Notification count:", notifications.length);

        if (notifications.length > 0) {
          console.log("Recent notifications:");
          notifications.slice(0, 5).forEach((notification, index) => {
            console.log(
              `${index + 1}. ${notification.title || "Notification"}`
            );
            console.log(`   Type: ${notification.type}`);
            console.log(
              `   Message: ${notification.body || notification.message}`
            );
            console.log(
              `   Time: ${
                notification.timestamp
                  ? new Date(notification.timestamp).toLocaleString()
                  : "N/A"
              }`
            );
            console.log("");
          });
        } else {
          console.log("No notifications found for this wallet");
        }
      } catch (error) {
        console.log("Notifications not available:", error.message);
      }

      // Get wallet subscriptions
      console.log("\n📋 Getting wallet subscriptions...");
      try {
        const subscriptions = await this.sdk.dialect.getSubscriptions(
          walletPublicKey
        );
        console.log("Subscription count:", subscriptions.length);

        if (subscriptions.length > 0) {
          console.log("Active subscriptions:");
          subscriptions.forEach((sub, index) => {
            console.log(`${index + 1}. ${sub.type || sub.id}`);
            console.log(`   Enabled: ${sub.enabled ? "Yes" : "No"}`);
            console.log(`   Config: ${JSON.stringify(sub.config, null, 2)}`);
            console.log("");
          });
        } else {
          console.log("No subscriptions found for this wallet");
        }
      } catch (error) {
        console.log("Subscriptions not available:", error.message);
      }

      // Get available notification types
      console.log("\n🔔 Getting available notification types...");
      try {
        const notificationTypes = await this.sdk.dialect.getNotificationTypes();
        console.log("Available notification types:", notificationTypes.length);

        if (notificationTypes.length > 0) {
          console.log("Notification types:");
          notificationTypes.forEach((type, index) => {
            console.log(`${index + 1}. ${type.name || type.id}`);
            console.log(`   Description: ${type.description}`);
            console.log("");
          });
        }
      } catch (error) {
        console.log("Notification types not available:", error.message);
      }

      // Example subscription creation
      console.log("\n➕ Example subscription creation...");
      try {
        const subscriptionData = {
          walletPublicKey: walletPublicKey,
          notificationType: "price-alerts",
          config: {
            threshold: 100,
            direction: "above",
          },
        };

        console.log(
          "Subscription data:",
          JSON.stringify(subscriptionData, null, 2)
        );
        console.log(
          "⚠️ Subscription simulation (not executed - uncomment to enable)"
        );

        // Uncomment to actually create subscription (requires proper setup)
        // const subscription = await this.sdk.dialect.subscribe(subscriptionData);
        // console.log('Created subscription:', subscription);
      } catch (error) {
        console.log("Subscription creation failed:", error.message);
      }

      // Example notification sending
      console.log("\n📤 Example notification sending...");
      try {
        const notificationData = {
          recipients: [walletPublicKey],
          title: "Test Notification",
          body: "This is a test notification from ForgeX SDK",
          type: "info",
        };

        console.log(
          "Notification data:",
          JSON.stringify(notificationData, null, 2)
        );
        console.log(
          "⚠️ Notification simulation (not executed - uncomment to enable)"
        );

        // Uncomment to actually send notification (requires proper setup and permissions)
        // const result = await this.sdk.dialect.sendNotification(notificationData);
        // console.log('Notification sent:', result);
      } catch (error) {
        console.log("Notification sending failed:", error.message);
      }
    } catch (error) {
      console.error("Wallet operations error:", error.message);
    }
  }

  // ================== COMPREHENSIVE DEMO ==================
  async runComprehensiveDemo(walletPublicKey = null) {
    console.log("💬 DIALECT COMPREHENSIVE DEMO");
    console.log("=".repeat(60));

    // Run all demonstrations
    await this.demonstrateNotificationSystem();
    await this.demonstrateMessagingPlatform();
    await this.demonstrateCommunityFeatures();
    await this.demonstrateIntegrationFeatures();
    await this.demonstrateAnalyticsInsights();

    // Run wallet operations if wallet provided
    if (walletPublicKey) {
      await this.demonstrateWalletOperations(walletPublicKey);
    }

    console.log("\n✅ DIALECT DEMO COMPLETED");
    console.log(
      "All Web3 messaging and notification features demonstrated successfully!"
    );
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Dialect SDK Demo...\n");

  // Initialize with API key (replace with your actual API key)
  const apiKey = process.env.DIALECT_API_KEY || "your-dialect-api-key";
  const dialectExample = new DialectExample(apiKey);

  // Optional: provide a wallet public key for wallet-specific operations
  const walletPublicKey = process.env.WALLET_PUBLIC_KEY || null;

  try {
    await dialectExample.runComprehensiveDemo(walletPublicKey);

    console.log("\n💡 Next Steps:");
    console.log(
      "1. Set DIALECT_API_KEY environment variable with your actual API key"
    );
    console.log("2. Connect a wallet to enable messaging features");
    console.log("3. Set up notification preferences");
    console.log("4. Join relevant community channels");
    console.log("5. Configure protocol integrations");
    console.log("6. Set up webhooks for your dApp");

    console.log("\n📝 Environment Variables:");
    console.log("   DIALECT_API_KEY - Your Dialect API key");
    console.log("   WALLET_PUBLIC_KEY - (Optional) Wallet address for testing");
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
    console.log(
      "\n⚠️ Note: Make sure to set your DIALECT_API_KEY environment variable"
    );
    console.log("   Some features require proper wallet setup and permissions");
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DialectExample };
