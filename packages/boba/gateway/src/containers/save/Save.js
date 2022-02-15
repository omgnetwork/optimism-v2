/*
  Utility Functions for OMG Plasma
  Copyright (C) 2021 Enya Inc. Palo Alto, CA

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { getFS_Saves, getFS_Info } from 'actions/fixedAction'

import ListSave from 'components/listSave/listSave'

import AlertIcon from 'components/icons/AlertIcon'

import { openModal } from 'actions/uiAction'
import Button from 'components/button/Button'

import * as S from './Save.styles'
import * as styles from './Save.module.scss'

import { Box, Typography, Grid, Divider } from '@mui/material'
import { Circle } from '@mui/icons-material'

import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'
import WalletPicker from 'components/walletpicker/WalletPicker'
import PageTitle from 'components/pageTitle/PageTitle'
import BobaGlassIcon from 'components/icons/BobaGlassIcon'
import Input from 'components/input/Input'

class Save extends React.Component {

  constructor(props) {

    super(props)

    const {
      stakeInfo,
    } = this.props.fixed

    const {
      accountEnabled,
      netLayer
    } = this.props.setup

    this.state = {
      stakeInfo,
      accountEnabled,
      netLayer,
      loading: false,
    }

  }

  componentDidMount() {
    this.props.dispatch(getFS_Saves())
    this.props.dispatch(getFS_Info())
  }

  componentDidUpdate(prevState) {

    const {
      stakeInfo
    } = this.props.fixed

    const {
      accountEnabled,
      netLayer
    } = this.props.setup

    if (!isEqual(prevState.fixed.stakeInfo, stakeInfo)) {
      this.setState({ stakeInfo })
    }

    if (!isEqual(prevState.setup.accountEnabled, accountEnabled)) {
      this.setState({ accountEnabled })
    }

    if (!isEqual(prevState.setup.netLayer, netLayer)) {
      this.setState({ netLayer })
    }

  }

  async handleAddSave() {
    if (this.state.accountEnabled)
      this.props.dispatch(openModal('saveDepositModal'))
  }

  render() {

    const {
      stakeInfo,
      loading,
      accountEnabled,
      netLayer
    } = this.state

    const { isMobile } = this.props
    /* 
        if (netLayer === 'L1') {
          return <div className={styles.container}>
            <S.LayerAlert>
              <S.AlertInfo>
                <AlertIcon />
                <S.AlertText
                  variant="body2"
                  component="p"
                >
                  You are on Ethereum Mainnet. Staking@5% is only available on Boba. SWITCH to Boba
                </S.AlertText>
              </S.AlertInfo>
              <LayerSwitcher isButton={true} />
            </S.LayerAlert>
          </div>
        }
    
    
        if (!netLayer) {
          return <div className={styles.container}>
            <S.LayerAlert>
              <S.AlertInfo>
                <AlertIcon />
                <S.AlertText
                  variant="body2"
                  component="p"
                >
                  You have not connected your wallet. To stake on BOBA, connect to MetaMask
                </S.AlertText>
              </S.AlertInfo>
              <WalletPicker />
            </S.LayerAlert>
          </div>
        } */

    return (
      <S.StakePageContainer>
        <Box sx={{ my: 1 }}>
          <PageTitle title="Boba Stake" />
          {(!accountEnabled || netLayer === 'L1') ?
            <Typography variant="body2" sx={{ color: '#FF6A55' }}><Circle sx={{ height: "10px", width: "10px" }} /> Disconnected</Typography>
            : <Typography variant="body2" sx={{ color: '#BAE21A' }}><Circle sx={{ height: "10px", width: "10px" }} /> Connected </Typography>
          }
        </Box>
        <Grid container spacing={1} sx={{ my: 2 }}>
          <Grid item sm={6} xs={12}>
            <S.StakeEarnContainer>
              <Box sx={{ my: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Typography variant="body2" sx={{ opacity: 0.65 }}> Stake Boba Earn Boba </Typography>
                <Typography variant="h1"> 5% Fixed APY </Typography>
                <S.DividerLine />
              </Box>
              <S.StakeItem sx={{ my: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ opacity: 0.65 }}>
                    Your staked
                  </Typography>
                  <Typography variant="h3" >
                    0 Boba
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.65 }}>
                    ≈ $0
                  </Typography>
                </Box>
              </S.StakeItem>
            </S.StakeEarnContainer>
            <S.StakeInputContainer>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2"> Boba Balance:</Typography>
                <Typography variant="body2"> -- </Typography>
              </Box>
              <Input
                value={0}
                type="number"
                onChange={(i) => { console.log([ 'i.target.value', i.target.value ]) }}
                variant="standard"
                newStyle
              />
              {!netLayer ?
                <WalletPicker fullWidth={true} label="Connet wallet" /> :
                netLayer === 'L2' ?
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => {}}
                    disabled={!accountEnabled}
                    fullWidth={true}
                  >
                    Stake
                  </Button>
                  :
                  <S.LayerAlert>
                    <S.AlertInfo>
                      <AlertIcon />
                      <S.AlertText
                        variant="body3"
                        component="p"
                      >
                        You are on Mainnet. To use the Boba DAO, SWITCH to Boba
                      </S.AlertText>
                    </S.AlertInfo>
                    <LayerSwitcher fullWidth={true} isButton={true} />
                  </S.LayerAlert>
              }
            </S.StakeInputContainer>
          </Grid>
          <Grid item sm={6} xs={12}>
            <S.StakeContainer>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <BobaGlassIcon />
                  <Typography variant="body1" >
                    Stake Boba
                  </Typography>
                </Box>
                <S.DividerLine />
              </Box>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <Box>
                  <Typography variant="body2">
                    <Circle sx={{ height: "6px", color: '#BAE21A', mr: 1, width: "6px" }} /> STAKING PERIOD:
                  </Typography>
                  <Typography variant="body3" sx={{ opacity: 0.65 }}>
                    Each staking period lasts 2 weeks. If you do not unstake after a staking period, your stake will be automatically renewed.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" >
                    <Circle sx={{ height: "6px", color: '#BAE21A', mr: 1, width: "6px" }} /> UNSTAKING WINDOW:
                  </Typography>
                  <Typography variant="body3" sx={{ opacity: 0.65 }}>
                    The first two days of every staking period, except for the first staking period, are the unstaking window. You can only unstake during the unstaking window.
                  </Typography>
                </Box>
                <S.DividerLine />
                <S.StakeItem>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ opacity: 0.65 }}>
                      Rewards earned
                    </Typography>
                    <Typography variant="h3" >
                      0 Boba
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.65 }}>
                      ≈ $0
                    </Typography>
                  </Box>
                </S.StakeItem>
                <S.DividerLine />
                <S.StakeItem>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ opacity: 0.65 }}>
                      Available unstake
                    </Typography>
                    <Typography variant="h3" >
                      0 Boba
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.65 }}>
                      ≈ $0
                    </Typography>
                  </Box>
                  <Button variant="contained" disabled={true}>Unstake</Button>
                </S.StakeItem>
              </Box>
            </S.StakeContainer>
          </Grid>
        </Grid>
        {/* <S.Wrapper>
          <Grid
            container
            spacing={2}
          >
            <S.GridItemTag
              item
              xs={10}
              md={10}
              style={{ padding: 0, paddingLeft: '20px' }}
            >
              <Typography variant="body2" sx={{ mt: 2, fontSize: '0.8em' }}>
                <span style={{ fontWeight: '700' }}>EARNINGS/APR</span>: You will earn an APR of 5%.
                <br />
                <span style={{ fontWeight: '700' }}>STAKING PERIOD</span>: Each staking period lasts 2 weeks.
                Your stake will be automatically renewed until you unstake.
                <br />
                <span style={{ fontWeight: '700' }}>UNSTAKING WINDOW</span>: You can
                unstake in the two days after each staking window.
              </Typography>
            </S.GridItemTag>
          </Grid>
        </S.Wrapper> */}

        {/* <Box sx={{ my: 3, width: '100%' }}>

          {accountEnabled &&
            <Button
              variant="contained"
              onClick={() => { this.handleAddSave() }}
              disabled={loading}
              sx={{ flex: 1, marginTop: '20px', marginBottom: '20px' }}
            >
              {loading ? 'Staking...' : 'Stake BOBA'}
            </Button>
          }

          {!isMobile ? (
            <S.TableHeading>
              <Grid
                container
                spacing={1}
              >
                <S.GridItemTag item md={1}><Typography variant="body2">Amount</Typography></S.GridItemTag>
                <S.GridItemTag item md={1}><Typography variant="body2">Earned</Typography></S.GridItemTag>
                <S.GridItemTag item md={1}><Typography variant="body2">Status</Typography></S.GridItemTag>
                <S.GridItemTag item md={3}><Typography variant="body2">Deposited</Typography></S.GridItemTag>
                <S.GridItemTag item md={4}><Typography variant="body2">Next Unstake Window</Typography></S.GridItemTag>
                <S.GridItemTag item md={2}><Typography variant="body2">Actions</Typography></S.GridItemTag>
              </Grid>
            </S.TableHeading>
          ) : (null)}

          <S.ListContainer>
            {Object.keys(stakeInfo).map((v, i) => {
              return (
                <ListSave
                  key={i}
                  stakeInfo={stakeInfo[ i ]}
                  isMobile={isMobile}
                />
              )
            })}
          </S.ListContainer>

        </Box> */}
      </S.StakePageContainer>
    )
  }
}

const mapStateToProps = state => ({
  fixed: state.fixed,
  setup: state.setup,
})

export default connect(mapStateToProps)(Save)
