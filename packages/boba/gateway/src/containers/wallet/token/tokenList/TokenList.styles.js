import { styled } from '@mui/material/styles'
import { Box, Typography } from '@mui/material';

export const Content = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 5px;
  width: 100%;
  padding: 10px;
`;


export const TableBody = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  text-align: center;
  borderBottom: '1px solid rgba(255, 255, 255, 0.04)';
`;

export const TableCell = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33.33%;
`;

export const TextTableCell = styled(Typography)`
  opacity: ${(props) => !props.enabled ? "0.4" : "1.0"};
  font-weight: 700;
`;
