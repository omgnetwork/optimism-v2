import { styled } from '@mui/material/styles'
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";

export const WrapperHeading = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  //margin-bottom: 10px;
  justify-content: space-between;
`;

export const TableHeading = styled(Box)(({ theme }) => ({
  padding: "10px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.secondary,

  [theme.breakpoints.down('md')]: {
    marginBottom: "5px",
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: "20px",
  },
}));

export const Wrapper = styled(Box)(({ theme, ...props }) => ({
  borderBottom: theme.palette.mode === 'light' ? '1px solid #c3c5c7' : '1px solid #192537',
  [theme.breakpoints.down('md')]: {
    //padding: '30px 10px',
  },
  [theme.breakpoints.up('md')]: {
    padding: '10px',
  },
}));

export const GridContainer = styled(Grid)(({theme})=>({
  //background: '#192333',
  //borderRadius: '8px',
  //height: '40px',
  //paddingTop: '5px',
  //paddingLeft: '20px',
  // [theme.breakpoints.down('md')]:{
  //   justifyContent: 'flex-start'
  // }
}))

export const TableHeadingItem = styled(Typography)`
  width: 20%;
  gap: 5px;
  text-align: center;
`;

export const AccountWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    backgroundColor: "transparent",
  },
  [theme.breakpoints.up('md')]: {
    backgroundColor: theme.palette.background.secondary,
    borderRadius: "10px",
    padding: "20px",
  },
}));

export const CardTag = styled(Card)(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  padding: '10px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  overflow: 'initial',
  minHeight: '225px',
  marginBottom: '20px',
  backgroundColor: theme.palette.background.secondary,
  [theme.breakpoints.up('lg')]: {
    margin: '60px 0 30px 0',
    },
}));

export const CardContentTag = styled(CardContent)(({ theme }) => ({
  clipPath: 'polygon(0 0, 93% 0, 100% 100%, 0% 100%)',
  backgroundColor: theme.palette.background.secondary,
  borderRadius: '6px',
  padding: '24px 34px 24px 24px',
  [theme.breakpoints.down('md')]: {
    flex: 5,
  },
  [theme.breakpoints.up('md')]: {
    flex: 12,
  },
}));

export const BalanceValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontSize: '50px !important',
  fontWeight: 700
}));

export const CardInfo = styled(Typography)`
  opacity: 0.7;
  font-size: 20px !important;
  margin-bottom: 10px;
`;

export const ContentGlass = styled(Box)(({ theme }) => ({
  transform: 'rotateZ(350deg)',
  position: 'absolute',
  top: '-50px',
  right: '-2px',
  [theme.breakpoints.up('md')]: {
  top: '-50px',
  right: '15px',
  },
  [theme.breakpoints.up('lg')]: {
  top: '-55px',
  right: '45px',
  },
}));

export const LayerAlert = styled(Box)(({ theme }) => ({
  width: "100%",
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '30px',
  borderRadius: '8px',
  margin: '20px 0px',
  padding: '25px',
  background: theme.palette.background.secondary,
  [theme.breakpoints.up('md')]: {
    padding: '25px 50px',
  },

}));

export const AlertText = styled(Typography)(({ theme }) => ({
  marginLeft: '10px',
  flex: 4,
  [theme.breakpoints.up('md')]: {
  },
}));

export const AlertInfo = styled(Box)`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
`;
