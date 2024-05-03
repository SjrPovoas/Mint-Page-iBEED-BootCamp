import Head from 'next/head'
import styles from '../styles/home.module.scss'
import { useEffect, useState } from 'react'
import { ConnectWallet, useAddress, useSwitchChain, useNetworkMismatch, ChainId, useContract, MediaRenderer, useNFT, useNFTs, useChainId, useSDK } from "@thirdweb-dev/react"
import { toast } from 'react-toastify'
import { NextPageContext } from 'next'


/*
  /$$$$$$                /$$$$$$$                                                  
 /$$__  $$              | $$__  $$                                                 
| $$  \__/ /$$  /$$$$$$ | $$  \ $$ /$$$$$$  /$$    /$$ /$$$$$$   /$$$$$$   /$$$$$$$
|  $$$$$$ |__/ /$$__  $$| $$$$$$$//$$__  $$|  $$  /$$//$$__  $$ |____  $$ /$$_____/
 \____  $$ /$$| $$  \__/| $$____/| $$  \ $$ \  $$/$$/| $$  \ $$  /$$$$$$$|  $$$$$$ 
 /$$  \ $$| $$| $$      | $$     | $$  | $$  \  $$$/ | $$  | $$ /$$__  $$ \____  $$
|  $$$$$$/| $$| $$      | $$     |  $$$$$$/   \  $/  |  $$$$$$/|  $$$$$$$ /$$$$$$$/
 \______/ | $$|__/      |__/      \______/     \_/    \______/  \_______/|_______/ 
     /$$  | $$                                                                     
    |  $$$$$$/                                                                     
     \______/                                                                      
*/

export default function Home(){
  const address = useAddress()
  const [loading, setLoading] = useState(true)
  const [loadingMint, setLoadingMint] = useState(null)
  const [minted, setMinted] = useState(0)
  const [amount, setAmount] = useState(1)
  const switchChain = useSwitchChain()
  const isMismatched = useNetworkMismatch()
  const nameProjet = "Collection Cleanning Portion Water"  // Nome do seu Projeto
  const { contract } = useContract("0x72147D7716A8CfEDb41FeAEaD590A37e43C661C9") // Endereço da sua Coleção

  type Metadata = {
    id: number;
    name: string;
    description: string;
    image: string;
  }

  type NFTData = {
    owner: string;
    metadata: Metadata;
    type: string;
    supply: number;  
  }


  const [nfts, setNFTs] = useState<any>([])
  async function GetDataTokens(){
      const { data: nftsGet, isLoading, error } = useNFTs(contract);

      if(loading){    
        if(nftsGet){
          setNFTs(nftsGet);
          setLoading(false)
          console.log(nftsGet)
        }
      }

      //return nftsGet;
  }

  GetDataTokens()

  async function TotalMinted(token:any){
    //var par = document.getElementById("p"+token);

    const par = document.getElementById(
      "p"+token,
    ) as HTMLElement | null;
    
    if(par){
      const data = await (await contract)?.call("totalSupply", [token])
      .then(function(myValue: any){
        const minted = myValue.toString()
        setMinted(myValue)
        par.innerHTML = minted+" Minted"
        //console.log("total:"+minted)


      }).catch(function(error: any){
        //console.log(error)
      })
    }

  }

  async function Claim(token:any){
    
    setLoadingMint(token)

    if(!address){
      toast.error('Connect your wallet')
      setLoadingMint(null)
      return
    }

  
    const tx = await contract?.erc1155.claim(token, amount)
    .then(function(myValue: any){
      const receipt = myValue 
      TotalMinted(token)
      toast.success(`Congrats! Your NFT was minted successfuly.`)

    }).catch(function(error: any){
      //console.log(error)
      TotalMinted(token)
      toast.error("Ops! We can't mint your NFT")
    })
    setLoadingMint(null)
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>{nameProjet}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta content="#000000" name="theme-color"></meta>
      </Head>
      <main className={styles.mainContainer}>
        <div className={styles.titleContainer}>
          <h1>Cleanning Portion Water</h1>
        </div>

        <div className={styles.walletContainer}>
          { address && isMismatched ?
            <button onClick={ () => switchChain(ChainId.Polygon)} className={styles.btnChain}>Switch Chain</button>
          : 
            <ConnectWallet modalTitle="Connect Wallet | Login" btnTitle='Connect Wallet&nbsp;&nbsp;|&nbsp;&nbsp;Login' className={styles.btn}  />
          }
        </div>
        <div className={styles.mainGrid}>
          
          {loading?
                  <div className={styles.loading}>
                    <svg className={styles.spinner} width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                      <circle className={styles.path} fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
                    </svg>
                  </div> 
                :
                <>
            {nfts.map((token:any,index:any) => {
              if(token.metadata.id>1 && token.metadata.id !=7){
                return(
                  <div className={styles.claimContainer} key={token.metadata.id}>
              
                    <div className={styles.infoContainer}>
                      <MediaRenderer 
                        src={token.metadata.image}
                        alt="NFT Imagem"
                        className={styles.media}
                      />
                      <p id={"p"+token.metadata.id}>{token.supply} Minted</p>
                      <p>{token.metadata.name}</p>
                      <span>{token.metadata.description}</span>
                      <div id={"mtc"+token.metadata.id} className={styles.mintContainer}>
                      { loadingMint === token.metadata.id?
                      <div className={styles.btnLoadMint}>
                        <div className={styles.loading}>
                          <svg className={styles.spinner} width="30px" height="30px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                            <circle className={styles.path} fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
                          </svg>
                        </div> 
                      </div>
                      :
                        <button className={styles.btnMint} onClick={() => Claim(token.metadata.id) }>Mint Now</button>
                      }
                      </div>
                    </div>
                  
                  </div>
                )
              }
            })}
            </>
            
          }
          <div className={styles.clr}></div>
        </div>
        <footer>
        <p>Copyrights © 2023 &nbsp;&nbsp;|&nbsp;&nbsp; {nameProjet} &nbsp;&nbsp;|&nbsp;&nbsp;   <a className={styles.link} href='https://sjrpovoas-collection-cleanning-portion-water-mint-page.vercel.app/' target='_blank'>sjrpovoas-collection-cleanning-portion-water-mint-page.vercel.app</a></p>       
        </footer>
      </main>      
    </div>
  )
}