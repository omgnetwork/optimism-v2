import React from 'react'
import * as S from './PageHeader.styles'
import { ReactComponent as BobaLogo } from '../../images/boba2/logo-boba2.svg'
import MenuItems from 'components/mainMenu/menuItems/MenuItems'
import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'
import ThemeSwitcher from 'components/mainMenu/themeSwitcher/ThemeSwitcher'
import { useState } from 'react'
import { Box, Container, useMediaQuery, useTheme } from '@mui/material'
import NavIcon from 'components/icons/NavIcon'
import WalletIcon from 'components/icons/WalletIcon'

const PageHeader = () => {
    
   // eslint-disable-next-line no-unused-vars
  const [ open, setOpen ] = useState();
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  return (
    <>
      {
        isMobile ? (
          <Container>
            <S.HeaderWrapper>
              <BobaLogo style={{ maxWidth: '160px' }} />
              <S.HeaderActionButton>
                <Box onClick={() => setOpen(!open)} sx={{ cursor: 'pointer' }}>
                  <WalletIcon />
                </Box>
                <Box onClick={() => setOpen(!open)} sx={{ cursor: 'pointer' }}>
                  <NavIcon />
                </Box>
              </S.HeaderActionButton>
            </S.HeaderWrapper>
          </Container>
        ) : (<S.HeaderWrapper>
          <BobaLogo style={{ maxWidth: '160px' }} />
          <MenuItems setOpen={setOpen} />
          <LayerSwitcher />
          <ThemeSwitcher />
        </S.HeaderWrapper>   )
      }
    </>
  )
}

export default PageHeader
