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

import React, {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Typography } from '@mui/material'
import { useTheme } from '@emotion/react'

import { openError, openModal } from 'actions/uiAction'

import Button from 'components/button/Button'
import Proposal from 'components/listProposal/listProposal'
import Pager from 'components/pager/Pager'

import * as styles from './proposalList.module.scss'

import { selectProposals, selectProposalThreshold, selectDaoVotes, selectDaoVotesX} from 'selectors/daoSelector'
import { selectLoading } from 'selectors/loadingSelector'
import { selectAccountEnabled } from 'selectors/setupSelector'

import { orderBy } from 'lodash'

const PER_PAGE = 8

function ProposalList() {

    const theme = useTheme()

    const [page, setPage] = useState(1)
    const dispatch = useDispatch()

    const loading = useSelector(selectLoading(['PROPOSALS/GET']))
    const proposals = useSelector(selectProposals)
    const proposalThreshold = useSelector(selectProposalThreshold)
    const accountEnabled = useSelector(selectAccountEnabled())

    const votes = useSelector(selectDaoVotes)
    const votesX = useSelector(selectDaoVotesX)

    const orderedProposals = orderBy(proposals, i => i.startTimestamp, 'desc')

    const startingIndex = page === 1 ? 0 : ((page - 1) * PER_PAGE)
    const endingIndex = page * PER_PAGE
    const paginatedProposals = orderedProposals.slice(startingIndex, endingIndex)

    let totalNumberOfPages = Math.ceil(orderedProposals.length / PER_PAGE)
    if (totalNumberOfPages === 0) totalNumberOfPages = 1

    return <>
        <div className={styles.containerAction}>
            <p className={styles.listTitle}>Proposals</p>
            <Button
                type="primary"
                variant="contained"
                disabled={!accountEnabled}
                onClick={() => {
                    if(Number(votes + votesX) < Number(proposalThreshold)) {
                        dispatch(openError(`Insufficient BOBA to create a new proposal. You need at least ${proposalThreshold} BOBA + xBOBA to create a new proposal.`))
                    } else {
                        dispatch(openModal('newProposalModal'))
                    }
                }}
            >Create</Button>
        </div>
        <div className={styles.listContainer}
            style={{ background: theme.palette.background.secondary }}
        >
            <Typography variant="body2" className={styles.helpTextLight}>
                At least {proposalThreshold} BOBA + xBOBA are needed to create a new proposal
            </Typography>
            <Pager
                currentPage={page}
                isLastPage={paginatedProposals.length < PER_PAGE}
                totalPages={totalNumberOfPages}
                onClickNext={()=>setPage(page + 1)}
                onClickBack={()=>setPage(page - 1)}
            />
            {!!loading && !proposals.length ? <div className={styles.loadingContainer}> Loading... </div> : null}
            {paginatedProposals.map((p, index) => {
                return <React.Fragment key={index}>
                    <Proposal proposal={p} />
                </React.Fragment>
            })}
        </div>
    </>
}

export default React.memo(ProposalList)