const { ForgeXSolanaSDK } = require('../');

async function clockworkExample() {
  try {
    // Initialize SDK (Clockwork uses RPC connection)
    const sdk = new ForgeXSolanaSDK({});

    console.log('⏰ ForgeX Clockwork Integration Example\n');

    // Get Clockwork program info
    console.log('Getting Clockwork program info...');
    const programInfo = await sdk.clockwork.getProgramInfo();
    console.log('Program Info:', programInfo);

    // Get thread accounts
    console.log('\nGetting thread accounts...');
    try {
      const threads = await sdk.clockwork.getThreadAccounts();
      console.log('Thread count:', threads.length);
      
      if (threads.length > 0) {
        console.log('First thread:', {
          pubkey: threads[0].pubkey.toString(),
          account: {
            authority: threads[0].account.authority.toString(),
            id: threads[0].account.id,
            paused: threads[0].account.paused,
            execContext: threads[0].account.execContext
          }
        });
      }
    } catch (error) {
      console.log('Threads not available:', error.message);
    }

    // Get worker accounts
    console.log('\nGetting worker accounts...');
    try {
      const workers = await sdk.clockwork.getWorkerAccounts();
      console.log('Worker count:', workers.length);
      
      if (workers.length > 0) {
        console.log('First worker:', {
          pubkey: workers[0].pubkey.toString(),
          account: {
            authority: workers[0].account.authority.toString(),
            commission: workers[0].account.commission,
            signatory: workers[0].account.signatory.toString()
          }
        });
      }
    } catch (error) {
      console.log('Workers not available:', error.message);
    }

    // Get queue accounts
    console.log('\nGetting queue accounts...');
    try {
      const queues = await sdk.clockwork.getQueueAccounts();
      console.log('Queue count:', queues.length);
      
      if (queues.length > 0) {
        console.log('First queue:', {
          pubkey: queues[0].pubkey.toString(),
          account: {
            authority: queues[0].account.authority.toString(),
            size: queues[0].account.size,
            rotator: queues[0].account.rotator
          }
        });
      }
    } catch (error) {
      console.log('Queues not available:', error.message);
    }

    console.log('\n✅ Clockwork example completed successfully!');

  } catch (error) {
    console.error('❌ Error in Clockwork example:', error.message);
  }
}

// Run the example
if (require.main === module) {
  clockworkExample();
}

module.exports = clockworkExample;