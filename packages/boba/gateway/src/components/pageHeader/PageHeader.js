import React from 'react'
import * as S from './PageHeader.styles'
import { ReactComponent as BobaLogo } from '../../images/boba2/logo-boba2.svg'
import MenuItems from 'components/mainMenu/menuItems/MenuItems'
import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'
import ThemeSwitcher from 'components/mainMenu/themeSwitcher/ThemeSwitcher'
import { useState } from 'react'
import { Typography } from '@mui/material';

const PageHeader = () => {
    
   const [open, setOpen]= useState();
  
  return (
    <S.HeaderWrapper>
      <BobaLogo style={{ maxWidth: '160px' }} />
      <MenuItems setOpen={setOpen} />
      <LayerSwitcher />
      <ThemeSwitcher />
    </S.HeaderWrapper>
  )
}

export default PageHeader
