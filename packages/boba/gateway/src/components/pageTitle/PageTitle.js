import { Typography } from '@material-ui/core';
import React from 'react';
import * as S from './PageTitle.styles';

const PageTitle = ({ title }) => {

  return (
    <S.Wrapper>
      <Typography variant="h1">{title}</Typography>
    </S.Wrapper>
  )
};

export default PageTitle;
