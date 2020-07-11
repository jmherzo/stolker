import React from "react";

// components
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";

// Types
import { ICompanySymbol } from "../types/ICompanySymbol";

export interface ISearchProps {
  isInvalid: boolean;
  isRepeated: boolean;
  isLoading: boolean;
  companySymbols: string[];
  companyProfiles?: { [symbol: string]: ICompanySymbol };
  symbolToSearch: string;
  onChangeSearchField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAdd: () => void;
}

const Search: React.FC<ISearchProps> = ({
  isInvalid,
  isRepeated,
  isLoading,
  companySymbols,
  companyProfiles,
  symbolToSearch,
  onChangeSearchField,
  onDelete,
  onAdd,
}): JSX.Element => {
  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
            disabled={isLoading}
            error={isRepeated || isInvalid}
            helperText={
              isRepeated
                ? "Enter a unique stock symbol"
                : isInvalid
                ? "Enter a valid stock symbol"
                : undefined
            }
            onChange={onChangeSearchField}
            label="Stock symbol"
            variant="outlined"
            value={symbolToSearch}
          />
        </Grid>
        <Grid item>
          <Button
            disabled={isLoading}
            onClick={onAdd}
            size="large"
            variant="contained"
            color="primary"
          >
            Add
          </Button>
        </Grid>
      </Grid>
      {companyProfiles && companySymbols.length > 0 && (
        <Grid container spacing={2}>
          {companySymbols.map((symbol, i) => (
            <Grid item xs={12} sm={6} key={`profile_${symbol}_${i}`}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container>
                    <Grid item xs={10}>
                      <Typography variant="h6" gutterBottom>
                        {companyProfiles[symbol].displaySymbol}
                      </Typography>
                      <Typography color="primary">
                        {companyProfiles[symbol].description}
                      </Typography>
                      <Typography>
                        ${companyProfiles[symbol].price || "--"}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        color="secondary"
                        data-id={symbol}
                        aria-label="delete button"
                        id="deleteButton"
                        onClick={onDelete}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default Search;
