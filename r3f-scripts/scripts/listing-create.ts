import {
  ChainOrRpc,
  NATIVE_TOKEN_ADDRESS,
  ThirdwebSDK,
} from '@thirdweb-dev/sdk'
import 'dotenv/config'

// === UPDATE THESE VALUES TO MATCH YOUR CONTRACT AND NETWORK ===

const PRIVATE_KEY = process.env.PRIVATE_KEY!

export const COLLECTION_ADDRESS = '' // The address of the collection contract
export const network: ChainOrRpc = 'mumbai' // The network your contracts are deployed to

// ============================================================================================================

const main = async () => {
  try {
    // Instantiate the SDK with our private key onto the network
    const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY, network)

    const contractAddress = await sdk.deployer.deployMarketplace({
      name: 'Virtual Land Sales',
      description:
        'Example of a Virtual Land Sales Map for the Metaverse Gaming Projects',
    })
    const market = await sdk.getMarketplace(contractAddress)

    for (let i = 0; i <= 24; i++) {
      const listing = {
        // address of the contract the asset you want to list is on
        assetContractAddress: COLLECTION_ADDRESS,
        // token ID of the asset you want to list
        tokenId: i,
        // when should the listing open up for offers
        startTimestamp: new Date(),
        // how long the listing will be open for
        listingDurationInSeconds: 3_200_000_000,
        // how many of the asset you want to list
        quantity: 1,
        // address of the currency contract that will be used to pay for the listing
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        // how much the asset will be sold for
        buyoutPricePerToken: '0.1',
      }

      const tx = await market.direct.createListing(listing)

      console.log('🚀 tx: ', tx)
      console.log(`🟢 TokenId ${i} Listed`)
    }
    console.log('🟢 Succesfully listed 🎉')
    console.log('Check your dashboard to see the listed virtual lands:')
  } catch (e) {
    console.log('🔴 FAILED! Error creating listings:', e)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
