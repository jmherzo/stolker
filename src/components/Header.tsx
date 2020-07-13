import React from "react";

// Components
import Typography from "@material-ui/core/Typography";

const Header: React.FC = (): JSX.Element => {
  return (
    <>
      <Typography variant="h3">Stolker</Typography>
      <Typography gutterBottom>
        The best way to track your stocks from US exchange
      </Typography>
    </>
  );
};

export default Header;
