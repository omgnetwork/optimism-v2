/* eslint-disable quotes */
/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React from 'react'
import { Typography, Grid } from '@mui/material'

import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import * as styles from './listNFT.module.scss'
import * as S from './listNFT.styles';

class listNFT extends React.Component {

  constructor(props) {

    super(props);

    const {
      name,
      symbol,
      address,
      UUID,
      URL,
      meta
    } = this.props

    this.state = {
      name,
      symbol,
      address,
      UUID,
      URL,
      meta
    }
  }

  componentDidUpdate(prevState) {

    const {
      name, symbol, address,
      UUID, URL, meta
    } = this.props;

    if (!isEqual(prevState.name, name)) {
      this.setState({ name })
    }

    if (!isEqual(prevState.symbol, symbol)) {
      this.setState({ symbol })
    }

    if (!isEqual(prevState.address, address)) {
      this.setState({ address })
    }

    if (!isEqual(prevState.UUID, UUID)) {
      this.setState({ UUID })
    }

    if (!isEqual(prevState.URL, URL)) {
      this.setState({ URL })
    }

    if (!isEqual(prevState.meta, meta)) {
      this.setState({ meta })
    }

  }

  render() {

    const {
      name,
      symbol,
      URL,
      meta
    } = this.state

    return (
      <S.ListNFTItem item>

        <img
          src={URL}
          alt="NFT URI"
          width={'100%'}
        />
        <div className={styles.topContainer}>  
          <Typography variant="body1">
            {name} ({symbol})
          </Typography>
        </div>
        
        <div className={styles.topContainer}>
          <div className={styles.Table2}>
          
            

            {/* {meta.collection !== '' &&
              <Typography variant="body3">
                Collection: 
                <Typography variant="body3" component="span" className={styles.muted}>
                  {meta.collection}
                </Typography>
              </Typography>
            }
            {meta.rank !== '' &&
              <Typography variant="body3">
                Rank: 
                <Typography variant="body3" component="span" className={styles.muted}>
                  {meta.rank}
                </Typography>
              </Typography>
            }
            {meta.rarity_score !== '' &&
              <Typography variant="body3">
                Rarity: 
                <Typography variant="body3" component="span" className={styles.muted}>
                  {meta.rarity_score}
                </Typography>
              </Typography>
            }
            {(meta.attributes || []).map((attr, index) => {
              return (<Typography variant="body3" key={index}>{attr.trait_type}: 
                <Typography variant="body3" component="span" className={styles.muted}>
                  {attr.value}
                </Typography>
              </Typography>)
            })}
            {(meta.traits || []).map((attr, index) => {
              return (<Typography variant="body3" key={index}>
                {attr.trait_type}: 
                <Typography variant="body3" component="span" className={styles.muted}>
                  {attr.trait_value}
                </Typography>
              </Typography>)
            })} */}
          </div>
        </div>
      </S.ListNFTItem>
    )
  }
}

const mapStateToProps = state => ({
  nft: state.nft
})

export default connect(mapStateToProps)(listNFT)
