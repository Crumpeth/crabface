import React from 'react';
import './App.css';
import { Container, Row, Col } from 'react-bootstrap';
import Logo from './logo.png'
import Receipt from './RECEIPT-APE.svg';
import CLAIM from './CLAIM-APE.svg';
import useState from 'react-usestateref'
import { web3Modal } from './ethereum/web3';
import Web3 from 'web3';
import { getApenoutContract } from './ethereum/apenout';
var web3Util = require('web3-utils');

let contract;
let web3;

const styles = {
  container: {
    padding: '3rem',
    background: '#fdf0cb',
    minHeight: '80vh',
    borderTop: '2rem solid #d1c095',
    borderBottom: '2rem solid #d1c095'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem'
  },
  logo: {
    width: '400px',
    maxWidth: '100%'
  },
  receiptContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%'
  },
  receipt: {
    maxWidth: '60%',
    maxHeight: '60vh',
    backgroundImage: `url(${Receipt})`,
    backgroundSize: 'contain',
    aspectRatio: '77/150',
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  claimContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%'
  },
  claim: {
    maxHeight: '60vh',
    maxWidth: '100%',
    cursor: 'pointer'
  },
  textBoxContainer: {
    position: 'absolute',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    width: '250px',
    maxWidth: '60%'
  },
  textBoxTop: {
    width: '100%',
    flex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  textBoxBottom: {
    width: '100%',
    flex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderTop: '3px solid #666666'
  },
  connectWalletContainer: {
    border: '10px solid #ff001f',
    borderRadius: '30px',
    background: '#ead9c8',
    maxWidth: '400px',
    display: 'flex'
  },
  connectWalletButton: {
    cursor: 'pointer',
    border: '8px solid #fff300',
    borderRadius: '12px',
    background: '#ff001f',
    color: 'white'
  },
  textHeading: {
    width: '100%',
    color: '#666666'
  },
  textSubHeading: {
    width: '100%',
    fontSize: '4vh',
    color: '#666666'
  }
}

const ConnectWallet = props => (
  <div style={styles.connectWalletContainer} onClick={props.onConnectClick}>
    <div style={styles.connectWalletButton}>
      Connect Wallet
    </div>
  </div>
)

function App() {
  const [chainState, setChainState, chainStateRef] = useState(0);
  const [accountState, setAccountState, accountStateRef] = useState();
  const [claimState, setClaimState, claimStateRef] = useState({
    loading: false,
    claimed: 0,
    unclaimed: 0
  });

  React.useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  const connectWallet = async () => {
    const provider = await web3Modal.connect();
    web3 = new Web3(provider);
    contract = getApenoutContract(web3);
    console.log("contract == ", contract);

    subscribeToProvider(provider);
    const accounts = await web3.eth.getAccounts();
    setAccountState(accounts[0]);
    getClaimState();
  }

  const subscribeToProvider = async (provider) => {
    provider.on("accountsChanged", (accounts) => {
      setAccountState(accounts[0]);
      getClaimState();
    });

    provider.on("chainChanged", (chainId) => {
      setChainState(chainId);
      connectWallet();
      getClaimState();
    });

    provider.on("connect", (info) => {
      connectWallet();
      getClaimState();
    });

    provider.on("disconnect", (error) => {
      // resetState();
    });
  }

  const getClaimState = async () => {
    if (!accountStateRef.current) {
      resetState();
      return;
    };

    const stats = await contract.methods.getAccountDividendsInfo(accountStateRef.current).call();
    console.log("states == ", stats);
    setClaimState({
      unclaimed: parseFloat(web3Util.fromWei(stats['1'], 'ether')).toFixed(4),
      claimed: parseFloat(web3Util.fromWei(stats['2'], 'ether')).toFixed(4),
      // claimed: parseFloat(web3Util.fromWei(stats['3'], 'ether')).toFixed(4),
    })
  }

  const resetState = () => {
    setClaimState({
      unclaimed: 0,
      claimed: 0,
    })
  }

  const handleClaim = async () => {
    setClaimState({ ...claimState, loading: true });

    try {
      await contract.methods.claim().send({ from: accountState });
    } catch (err) {

    }
  }
  return (
    <Container fluid={true}>
      <Row>
        <Col>
          <div style={styles.logoContainer}>
            <img style={styles.logo} src={Logo}></img>
          </div>
        </Col>
      </Row>

      {!accountStateRef.current ?
        <Row>
          <ConnectWallet
            onConnectClick={() => connectWallet()}
          />
        </Row>
        :
        <Row style={styles.container}>
          <Col md="12" lg="4">
            <div style={styles.receiptContainer}>
              <div style={styles.receipt}>


                <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={styles.textBoxTop}>
                    <h1 style={styles.textHeading}>PENDING</h1>
                    <div style={styles.textSubHeading}>{claimState.unclaimed}</div>
                  </div>

                  <div style={styles.textBoxBottom}>
                    <h1 style={styles.textHeading}>Claimed</h1>
                    <div style={styles.textSubHeading}>{claimState.unclaimed}</div>
                  </div>

                </div>
              </div>
              {/* <img style={styles.receipt} src={Receipt}></img> */}
            </div>
          </Col>
          <Col md="12" lg="8">
            <div style={styles.claimContainer}>
              <img style={styles.claim} src={CLAIM} onClick={() => handleClaim()}></img>
            </div>
          </Col>
        </Row>

      }
    </Container>);
}

export default App;
