import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import {
  ConnectWallet,
  useAddress,
  useBuyNow,
  useContract,
} from '@thirdweb-dev/react'
import type { NextPage } from 'next'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Event, Mesh } from 'three'
import styles from '../styles/Home.module.css'

const MARKETPLACE_ADDRESS = ''

type LandCell = {
  position: {
    x: number
    y: number
  }
}

let intersects
const mousePosition = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const squareMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 4, 2),
  new THREE.MeshBasicMaterial({
    wireframe: true,
  })
)

const Home: NextPage = () => {
  const [objects, setObjects] = useState<LandCell[]>([])
  const landPlane = useRef<Mesh>(null)
  const highlightedLand = useRef<Mesh>(null)
  const virtualCam = useRef<THREE.Camera>(null!)
  const address = useAddress()
  const { contract: marketplace } = useContract(
    MARKETPLACE_ADDRESS,
    'marketplace'
  )
  const { mutate: buyNow, isLoading } = useBuyNow(marketplace)

  const onHoverLands = (e: Event) => {
    if (!landPlane.current || !highlightedLand.current) return

    // Check if mouse is over a square
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mousePosition, virtualCam.current)
    intersects = raycaster.intersectObject(landPlane.current)

    // If hovering the plane
    if (intersects.length > 0) {
      // Check if the land is already bought
      const objectExist = objects.find(function (object: any) {
        if (!highlightedLand.current) return

        return (
          object.position.x === highlightedLand.current.position.x &&
          object.position.z === highlightedLand.current.position.z
        )
      })

      // Set color to white if land is still available
      const mat = highlightedLand.current.material as any
      if (!objectExist) mat.color.setHex(0xffffff)
      else mat.color.setHex(0xff0000)

      // Move highlight to the square under mouse position
      const intersect = intersects[0]
      new THREE.Vector3()
      const highlightPos = new THREE.Vector3().copy(intersect.point).round()
      console.log('highlightPos: ', highlightPos)
      highlightedLand.current.position.set(
        highlightPos.x,
        -1.49,
        highlightPos.z
      )
    }
  }

  const onClickLand = async () => {
    if (!highlightedLand.current) return

    // Check if the land is already bought
    const objectExist = objects.find(function (object: any) {
      return (
        object.position.x === highlightedLand.current?.position.x &&
        object.position.z === highlightedLand.current?.position.z
      )
    })

    // Check if the land is already bought
    if (!objectExist) {
      if (intersects.length > 0) {
        // Buy it
        if (!marketplace || !address) {
          alert('Please, connect wallet to Mumbai')
          return
        }

        const listingId = 0
        const listings = await marketplace.getAddress()
        // buyNow({ buyAmount: 1, id: listingId, type:  })

        const mat = highlightedLand.current.material as any
        mat.color.setHex(0xff0000)
        const squareClone = squareMesh.clone()
        squareClone.position.copy(highlightedLand.current.position)
        setObjects([...objects, squareClone])
      }
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Canvas>
          <mesh
            ref={highlightedLand}
            position={[0, -1.49, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeBufferGeometry args={[1, 1]} />
            <meshBasicMaterial side={THREE.DoubleSide} transparent />
          </mesh>
          {objects.map((item) => {
            return (
              <mesh
                key={item.position.x + item.position.y}
                ref={highlightedLand}
                position={[0, -2.49, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                geometry={new THREE.PlaneGeometry(1, 1)}
              >
                <meshBasicMaterial side={THREE.DoubleSide} transparent />
              </mesh>
            )
          })}
          <gridHelper
            args={[5, 5, '#211E30', '#211E30']}
            position={[0, -1.49, 0]}
          />
          <mesh
            position={[0, -1.5, 0]}
            ref={landPlane}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={onHoverLands}
            onPointerDown={onClickLand}
          >
            <planeBufferGeometry args={[5, 5]} />
            <meshBasicMaterial side={THREE.DoubleSide} color={'#00C168'} />
          </mesh>

          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <PerspectiveCamera
            makeDefault
            ref={virtualCam}
            position={[5, 0, 11]}
            fov={40}
            far={1000}
          />
          <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} />
        </Canvas>
        <div className={styles.connect}>
          <ConnectWallet />
        </div>
      </main>
    </div>
  )
}

export default Home
