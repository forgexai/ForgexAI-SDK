const { ForgexSDK } = require('../dist/index.js');

class CrossmintExample {
    constructor(apiKey) {
        this.sdk = new ForgexSDK({ crossmint: { apiKey } });
        this.isWalletConnected = false;
    }

    // Connect wallet for minting operations
    async connectWallet(wallet) {
        try {
            this.sdk = new ForgexSDK({ 
                crossmint: { apiKey: this.sdk.crossmint.apiKey },
                wallet 
            });
            this.isWalletConnected = true;
            console.log("✅ Wallet connected for Crossmint operations");
        } catch (error) {
            console.error("Failed to connect wallet:", error.message);
        }
    }

    // ================== NFT MINTING ==================
    async demonstrateNFTMinting() {
        console.log("\n🎨 CROSSMINT NFT MINTING");
        console.log("=" .repeat(50));

        try {
            // Collection creation
            console.log("\n📁 NFT Collection Management:");
            const collectionConfig = {
                name: "ForgeX Demo Collection",
                description: "A demo collection showcasing Crossmint integration",
                symbol: "FORGEX",
                image: "https://example.com/collection-image.png",
                externalUrl: "https://forgex.ai",
                attributes: [
                    { trait_type: "Category", value: "Demo" },
                    { trait_type: "Creator", value: "ForgeX" }
                ]
            };

            if (this.isWalletConnected) {
                console.log("Creating NFT Collection...");
                const collection = await this.sdk.crossmint.createCollection(collectionConfig);
                console.log(`✅ Collection created: ${collection?.id || 'Success'}`);
                
                // Mint NFT to collection
                console.log("\n🖼️ Minting NFT:");
                const nftMetadata = {
                    name: "ForgeX Demo NFT #1",
                    description: "First NFT in the ForgeX demo collection",
                    image: "https://example.com/nft-image.png",
                    attributes: [
                        { trait_type: "Rarity", value: "Common" },
                        { trait_type: "Element", value: "Fire" },
                        { trait_type: "Power", value: "75" }
                    ],
                    collectionId: collection?.id
                };

                const mintResult = await this.sdk.crossmint.mintNFT(nftMetadata);
                console.log(`✅ NFT minted: ${mintResult?.transactionId || 'Success'}`);
            } else {
                console.log("ℹ️ Wallet connection required for minting operations");
                console.log("Sample collection config:", JSON.stringify(collectionConfig, null, 2));
            }

            // Batch minting
            console.log("\n🔢 Batch Minting Operations:");
            const batchNFTs = [
                {
                    name: "ForgeX Demo NFT #2",
                    description: "Second NFT in the series",
                    attributes: [
                        { trait_type: "Rarity", value: "Rare" },
                        { trait_type: "Element", value: "Water" }
                    ]
                },
                {
                    name: "ForgeX Demo NFT #3",
                    description: "Third NFT in the series",
                    attributes: [
                        { trait_type: "Rarity", value: "Epic" },
                        { trait_type: "Element", value: "Earth" }
                    ]
                }
            ];

            console.log(`Batch size: ${batchNFTs.length} NFTs`);
            console.log("Sample batch metadata:", JSON.stringify(batchNFTs[0], null, 2));

            if (this.isWalletConnected) {
                const batchResult = await this.sdk.crossmint.batchMintNFTs(batchNFTs);
                console.log(`✅ Batch minted: ${batchResult?.transactionIds?.length || 0} NFTs`);
            }

        } catch (error) {
            console.error("NFT minting error:", error.message);
        }
    }

    // ================== CROSS-CHAIN FUNCTIONALITY ==================
    async demonstrateCrossChainFunctionality() {
        console.log("\n🌉 CROSS-CHAIN FUNCTIONALITY");
        console.log("=" .repeat(50));

        try {
            // Supported chains
            console.log("\n🔗 Supported Blockchain Networks:");
            const supportedChains = [
                { name: "Solana", symbol: "SOL", network: "mainnet" },
                { name: "Ethereum", symbol: "ETH", network: "mainnet" },
                { name: "Polygon", symbol: "MATIC", network: "mainnet" },
                { name: "Arbitrum", symbol: "ARB", network: "mainnet" },
                { name: "Optimism", symbol: "OP", network: "mainnet" },
                { name: "Base", symbol: "BASE", network: "mainnet" }
            ];

            supportedChains.forEach((chain, index) => {
                console.log(`${index + 1}. ${chain.name} (${chain.symbol})`);
            });

            // Cross-chain minting
            console.log("\n🚀 Cross-Chain NFT Minting:");
            const crossChainConfig = {
                name: "Universal ForgeX NFT",
                description: "An NFT that exists across multiple blockchains",
                image: "https://example.com/universal-nft.png",
                targetChains: ["solana", "ethereum", "polygon"],
                attributes: [
                    { trait_type: "Type", value: "Cross-Chain" },
                    { trait_type: "Networks", value: "3" }
                ]
            };

            console.log("Cross-chain minting configuration:");
            console.log(`Target chains: ${crossChainConfig.targetChains.join(", ")}`);
            console.log(`NFT will be available on ${crossChainConfig.targetChains.length} networks`);

            if (this.isWalletConnected) {
                const crossChainResult = await this.sdk.crossmint.mintCrossChain(crossChainConfig);
                console.log(`✅ Cross-chain mint initiated: ${crossChainResult?.status || 'Success'}`);
            }

            // Bridge functionality
            console.log("\n🌉 NFT Bridging:");
            const bridgeConfig = {
                nftId: "sample-nft-id",
                fromChain: "solana",
                toChain: "ethereum",
                recipientAddress: "0x742d35Cc6634C0532925a3b8D8d1D24dFDe8E8d3"
            };

            console.log("Bridge configuration:");
            console.log(`From: ${bridgeConfig.fromChain}`);
            console.log(`To: ${bridgeConfig.toChain}`);
            console.log(`Recipient: ${bridgeConfig.recipientAddress}`);

            if (this.isWalletConnected) {
                const bridgeResult = await this.sdk.crossmint.bridgeNFT(bridgeConfig);
                console.log(`✅ Bridge transaction: ${bridgeResult?.transactionId || 'Success'}`);
            }

        } catch (error) {
            console.error("Cross-chain functionality error:", error.message);
        }
    }

    // ================== WALLET INTEGRATION ==================
    async demonstrateWalletIntegration() {
        console.log("\n👛 WALLET INTEGRATION");
        console.log("=" .repeat(50));

        try {
            // Email wallet creation
            console.log("\n📧 Email-Based Wallets:");
            const emailWalletConfig = {
                email: "user@example.com",
                blockchain: "solana"
            };

            console.log("Email wallet features:");
            console.log("• No seed phrase required");
            console.log("• Easy onboarding for Web2 users");
            console.log("• Social login integration");
            console.log("• Automatic wallet creation");

            console.log(`Sample email: ${emailWalletConfig.email}`);

            if (this.isWalletConnected) {
                const emailWallet = await this.sdk.crossmint.createEmailWallet(emailWalletConfig);
                console.log(`✅ Email wallet created: ${emailWallet?.address || 'Success'}`);
            }

            // Custodial wallet management
            console.log("\n🏦 Custodial Wallet Services:");
            const custodialFeatures = [
                {
                    feature: "Automatic Key Management",
                    description: "Secure key storage and rotation"
                },
                {
                    feature: "Gas Fee Abstraction",
                    description: "Users don't need native tokens for fees"
                },
                {
                    feature: "Multi-Chain Support",
                    description: "Single wallet across multiple networks"
                },
                {
                    feature: "Compliance Ready",
                    description: "Built-in KYC/AML features"
                }
            ];

            custodialFeatures.forEach((feature, index) => {
                console.log(`${index + 1}. ${feature.feature}`);
                console.log(`   ${feature.description}`);
                console.log("");
            });

            // Wallet analytics
            console.log("\n📊 Wallet Analytics:");
            if (this.isWalletConnected) {
                const walletStats = await this.sdk.crossmint.getWalletAnalytics();
                console.log("Wallet Statistics:");
                console.log(`Total Transactions: ${walletStats?.totalTxs || 0}`);
                console.log(`NFTs Owned: ${walletStats?.nftCount || 0}`);
                console.log(`Active Chains: ${walletStats?.activeChains || 0}`);
            } else {
                console.log("Sample wallet analytics:");
                console.log("Total Transactions: 247");
                console.log("NFTs Owned: 15");
                console.log("Active Chains: 3");
            }

        } catch (error) {
            console.error("Wallet integration error:", error.message);
        }
    }

    // ================== PAYMENT PROCESSING ==================
    async demonstratePaymentProcessing() {
        console.log("\n💳 PAYMENT PROCESSING");
        console.log("=" .repeat(50));

        try {
            // Fiat payment options
            console.log("\n💰 Fiat Payment Methods:");
            const paymentMethods = [
                { method: "Credit/Debit Cards", fees: "2.9% + $0.30", processing: "Instant" },
                { method: "Bank Transfer (ACH)", fees: "0.8%", processing: "1-3 days" },
                { method: "PayPal", fees: "3.49%", processing: "Instant" },
                { method: "Apple Pay", fees: "2.9% + $0.30", processing: "Instant" },
                { method: "Google Pay", fees: "2.9% + $0.30", processing: "Instant" }
            ];

            paymentMethods.forEach((payment, index) => {
                console.log(`${index + 1}. ${payment.method}`);
                console.log(`   Fees: ${payment.fees}`);
                console.log(`   Processing: ${payment.processing}`);
                console.log("");
            });

            // Checkout flow
            console.log("\n🛒 Checkout Flow:");
            const checkoutConfig = {
                nftId: "demo-nft-001",
                price: 49.99,
                currency: "USD",
                paymentMethods: ["card", "paypal", "apple_pay"],
                successUrl: "https://forgex.ai/success",
                cancelUrl: "https://forgex.ai/cancel"
            };

            console.log("Checkout Configuration:");
            console.log(`NFT ID: ${checkoutConfig.nftId}`);
            console.log(`Price: $${checkoutConfig.price} ${checkoutConfig.currency}`);
            console.log(`Payment Methods: ${checkoutConfig.paymentMethods.join(", ")}`);

            if (this.isWalletConnected) {
                const checkout = await this.sdk.crossmint.createCheckout(checkoutConfig);
                console.log(`✅ Checkout created: ${checkout?.url || 'Success'}`);
            }

            // Subscription payments
            console.log("\n🔄 Subscription Payments:");
            const subscriptionConfig = {
                planName: "Premium NFT Access",
                price: 9.99,
                interval: "monthly",
                features: [
                    "Access to exclusive NFT drops",
                    "Priority minting",
                    "Cross-chain transfers included",
                    "Advanced analytics"
                ]
            };

            console.log("Subscription Plan:");
            console.log(`Plan: ${subscriptionConfig.planName}`);
            console.log(`Price: $${subscriptionConfig.price}/${subscriptionConfig.interval}`);
            console.log("Features:");
            subscriptionConfig.features.forEach(feature => {
                console.log(`  • ${feature}`);
            });

        } catch (error) {
            console.error("Payment processing error:", error.message);
        }
    }

    // ================== MARKETPLACE INTEGRATION ==================
    async demonstrateMarketplaceIntegration() {
        console.log("\n🏪 MARKETPLACE INTEGRATION");
        console.log("=" .repeat(50));

        try {
            // Marketplace listing
            console.log("\n📝 NFT Marketplace Listing:");
            const listingConfig = {
                nftId: "demo-nft-001",
                price: 2.5,
                currency: "SOL",
                marketplace: "magic-eden",
                listingType: "fixed-price",
                duration: 30 // days
            };

            console.log("Listing Details:");
            console.log(`NFT ID: ${listingConfig.nftId}`);
            console.log(`Price: ${listingConfig.price} ${listingConfig.currency}`);
            console.log(`Marketplace: ${listingConfig.marketplace}`);
            console.log(`Type: ${listingConfig.listingType}`);
            console.log(`Duration: ${listingConfig.duration} days`);

            if (this.isWalletConnected) {
                const listing = await this.sdk.crossmint.listNFT(listingConfig);
                console.log(`✅ NFT listed: ${listing?.listingId || 'Success'}`);
            }

            // Auction functionality
            console.log("\n🔨 Auction Management:");
            const auctionConfig = {
                nftId: "premium-nft-001",
                startingPrice: 1.0,
                reservePrice: 5.0,
                currency: "SOL",
                duration: 7, // days
                auctionType: "english" // english, dutch, sealed-bid
            };

            console.log("Auction Details:");
            console.log(`Starting Price: ${auctionConfig.startingPrice} ${auctionConfig.currency}`);
            console.log(`Reserve Price: ${auctionConfig.reservePrice} ${auctionConfig.currency}`);
            console.log(`Type: ${auctionConfig.auctionType} auction`);
            console.log(`Duration: ${auctionConfig.duration} days`);

            // Sales analytics
            console.log("\n📈 Sales Analytics:");
            const salesMetrics = {
                totalSales: 156,
                totalVolume: 342.5,
                averagePrice: 2.2,
                topSale: 25.0,
                currency: "SOL"
            };

            console.log(`Total Sales: ${salesMetrics.totalSales}`);
            console.log(`Total Volume: ${salesMetrics.totalVolume} ${salesMetrics.currency}`);
            console.log(`Average Price: ${salesMetrics.averagePrice} ${salesMetrics.currency}`);
            console.log(`Highest Sale: ${salesMetrics.topSale} ${salesMetrics.currency}`);

            // Royalty management
            console.log("\n👑 Royalty Management:");
            const royaltyConfig = {
                percentage: 5.0, // 5%
                recipient: "creator-wallet-address",
                enforceRoyalties: true,
                splitRoyalties: [
                    { address: "creator-wallet", percentage: 3.0 },
                    { address: "platform-wallet", percentage: 2.0 }
                ]
            };

            console.log(`Royalty Rate: ${royaltyConfig.percentage}%`);
            console.log(`Enforce Royalties: ${royaltyConfig.enforceRoyalties ? 'Yes' : 'No'}`);
            console.log("Royalty Split:");
            royaltyConfig.splitRoyalties.forEach(split => {
                console.log(`  ${split.percentage}% to ${split.address}`);
            });

        } catch (error) {
            console.error("Marketplace integration error:", error.message);
        }
    }

    // ================== COMPREHENSIVE DEMO ==================
    async runComprehensiveDemo() {
        console.log("🌐 CROSSMINT COMPREHENSIVE DEMO");
        console.log("=" .repeat(60));

        // Run all demonstrations
        await this.demonstrateNFTMinting();
        await this.demonstrateCrossChainFunctionality();
        await this.demonstrateWalletIntegration();
        await this.demonstratePaymentProcessing();
        await this.demonstrateMarketplaceIntegration();

        console.log("\n✅ CROSSMINT DEMO COMPLETED");
        console.log("All NFT and cross-chain features demonstrated successfully!");
    }
}

// Main execution
async function main() {
    console.log("🚀 Starting Crossmint SDK Demo...\n");
    
    // Initialize with API key (replace with your actual API key)
    const apiKey = process.env.CROSSMINT_API_KEY || 'your-crossmint-api-key';
    const crossmintExample = new CrossmintExample(apiKey);
    
    try {
        await crossmintExample.runComprehensiveDemo();
        
        console.log("\n💡 Next Steps:");
        console.log("1. Connect a wallet to enable minting operations");
        console.log("2. Set up your NFT collection");
        console.log("3. Configure payment processing");
        console.log("4. Integrate with marketplaces");
        console.log("5. Explore cross-chain opportunities");
    } catch (error) {
        console.error("Demo failed:", error.message);
        console.log("\nNote: Make sure to set your CROSSMINT_API_KEY environment variable");
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { CrossmintExample };
