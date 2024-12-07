import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoadingGIF } from "../components/Loading_icon_cropped.gif"
import { GlobalDataContext } from '../GlobalDataContext';

describe('Loading spinner', () => {
  test('Loading spinner must have src = "Loading_icon_cropped.gif" and alt = "Loading"', () => {

    render(
    <GlobalDataContext.Provider value = {
      {
        loading__g_lineage_headers : false,
        loading__g_lineage_trie : true,
        loading__g_mutation_headers : true,
      }
      }>
      <LoadingScreen/>
    </GlobalDataContext.Provider>
    );
    const loading_spinner = screen.getByRole('img');
    expect(loading_spinner).toHaveAttribute('src', LoadingGIF);
    expect(loading_spinner).toHaveAttribute('alt', 'Loading');
  });
});