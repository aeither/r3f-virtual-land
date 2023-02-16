import { ChainOrRpc, ThirdwebSDK } from '@thirdweb-dev/sdk'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
dotenv.config()

const network: ChainOrRpc = 'mumbai' // The network your contracts are deployed to

if (!process.env.PRIVATE_KEY) throw 'PRIVATE_KEY not found'
const PRIVATE_KEY = process.env.PRIVATE_KEY

if (!process.env.PUBLIC_KEY) throw 'PUBLIC_KEY not found'
const PUBLIC_KEY = process.env.PUBLIC_KEY

const main = async () => {
  // Init SDK
  const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY, network)

  // Create contract
  console.log('creating contract...')
  const contractAddress = await sdk.deployer.deployNFTCollection({
    name: 'Metaverse Lands',
    description: 'Example of a Virtual Lands for the Metaverse Gaming Projects',
    primary_sale_recipient: PUBLIC_KEY,
  })
  const contract = await sdk.getNFTCollection(contractAddress)
  console.log('Contract created: ', contractAddress)

  // Create Metadata
  console.log('creating metadata...')
  let metadatas = []
  for (let x = 1; x <= 5; x++) {
    for (let y = 1; y <= 5; y++) {
      const coord = `Land (${x}, ${y})`
      metadatas.push({
        name: coord,
        description: 'Virtual Land Example',
        image: fs.readFileSync(path.resolve(__dirname, '../assets/Mark.png')),
        animation_url: fs.readFileSync(
          path.resolve(__dirname, '../assets/kitty_breadfast.glb')
        ),
      })
    }
  }

  // uploads and creates the NFTs on chain
  console.log('minting NFTs...')
  const tx = await contract.mintBatch(metadatas)
  if (tx[0]) {
    const firstNFT = await tx[0].data()
    console.log('First NFT: ', firstNFT)
  }

  console.log('🟢 Succesfully minted 🎉')
  console.log('Check your dashboard to see the NFT collection')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
