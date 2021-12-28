import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { openAlert, openError } from 'actions/uiAction'
import moment from 'moment'

import Button from 'components/button/Button'
import { Box, Typography, CircularProgress, Grid } from '@material-ui/core'
import * as S from "./ListSave.styles"

import { withdrawFS_Savings } from 'actions/fixedAction'

class ListSave extends React.Component {

  constructor(props) {

    super(props)

    const {
      stakeInfo
    } = this.props

    this.state = {
      stakeInfo,
    }

  }

  componentDidUpdate(prevState) {

    const { stakeInfo } = this.props

    if (!isEqual(prevState.stakeInfo, stakeInfo)) {
      this.setState({ stakeInfo })
    }

  }

  async handleUnstake() {

    const { stakeInfo } = this.state

    const withdrawTX = await this.props.dispatch(withdrawFS_Savings(stakeInfo.stakeId))

    if (withdrawTX) {
      this.props.dispatch(openAlert("Your BOBA were unstaked"))
    } else {
      this.props.dispatch(openError("Failed to unstake BOBA"))
    }

  }

  render() {

    const {
      stakeInfo,
    } = this.state

    const pageLoading = Object.keys(stakeInfo).length === 0

    const { isMobile } = this.props

    const timeDeposit_S = stakeInfo.depositTimestamp
    const timeDeposit = moment.unix(timeDeposit_S).format('MM/DD/YYYY hh:mm a')

    const timeNow_S = Math.round(Date.now() / 1000)

    const twoWeeks = 14 * 24 * 60 * 60
    const twoDays  =  2 * 24 * 60 * 60

    const duration_S = timeNow_S - timeDeposit_S

    const secondsOverWindow = duration_S % twoWeeks

    let locked = true

    if( duration_S >= twoWeeks && secondsOverWindow > 0 && secondsOverWindow <= twoDays ) {
      locked = false
    }

    const earned = stakeInfo.depositAmount * (0.05 / 365.0) * (duration_S / (24 * 60 * 60))

    const unlocktime_S = timeNow_S + twoWeeks - secondsOverWindow
    const unlocktimeNextBegin = moment.unix(unlocktime_S).format('MM/DD/YYYY hh:mm a')
    const unlocktimeNextEnd = moment.unix(unlocktime_S+twoDays).format('MM/DD/YYYY hh:mm a')

    return (
      <S.Wrapper>
        {pageLoading ? (
          <Box sx={{textAlign: 'center'}}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
        <S.Entry>
          <Grid 
            container
            spacing={2}
          >

            <S.GridItemTag 
              item
              xs={2}
              md={1}
            >
              {isMobile ? (
                <Typography variant="overline" sx={{opacity: 0.7, paddingRight: '5px'}}>Amount</Typography>
              ) : (null)}
              <Typography variant="body1">
                {stakeInfo.depositAmount ?
                  `${stakeInfo.depositAmount.toLocaleString(undefined, {maximumFractionDigits:2})}` : `0`
                }
              </Typography>
            </S.GridItemTag>

            <S.GridItemTag 
              item
              xs={6}
              md={3}
            >
              {isMobile ? (
                <Typography variant="overline" sx={{opacity: 0.7, paddingRight: '5px'}}>Deposited On</Typography>
              ) : (null)}
              <Typography variant="body1" style={{opacity: '0.4'}}>
                {timeDeposit}
              </Typography>
            </S.GridItemTag>

            <S.GridItemTag item
              xs={2}
              md={1}
            >
              {isMobile ? (
                <Typography variant="overline" sx={{opacity: 0.7, paddingRight: '5px'}}>Earned</Typography>
              ) : (null)}
              <Typography variant="body1">
                {earned.toFixed(3)}
              </Typography>
            </S.GridItemTag>

            <S.GridItemTag item
              xs={2}
              md={1}
              >
              <Typography variant="body1">
                {stakeInfo.isActive ? 'Active' : 'Not Active'}
              </Typography>
            </S.GridItemTag>

            <S.GridItemTag item
              xs={8}
              md={4}
            >
              {isMobile ? (
                <Typography variant="overline" sx={{opacity: 0.7, paddingRight: '5px'}}>Next Unstake Window</Typography>
              ) : (null)}
              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems:'flex-start'}}>
                <Typography variant="overline" style={{lineHeight: '1em'}}>Begin: {unlocktimeNextBegin}</Typography>
                <Typography variant="overline" style={{lineHeight: '1em'}}>End: {unlocktimeNextEnd}</Typography>
              </div>
            </S.GridItemTag>

            <S.GridItemTag item
              xs={4}
              md={2}
            >
              <Button
                variant="contained"
                onClick={()=>{this.handleUnstake()}}
                disabled={locked}
              >
                Unstake
              </Button>
            </S.GridItemTag>

          </Grid>
        </S.Entry>
        )}
      </S.Wrapper>
    )
  }
}

const mapStateToProps = state => ({
    fixed: state.fixed,
})

export default connect(mapStateToProps)(ListSave)
