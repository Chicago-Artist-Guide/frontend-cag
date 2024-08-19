import styled from 'styled-components';
import { breakpoints } from '../../theme/styleVars';

const DividerBar = styled.div`
  width: 105px;
  height: 8px;
  border-radius: 4px;
  margin: 12px auto;

  @media (min-width: ${breakpoints.md}) {
    margin: 12px 0;
  }
`;

export default DividerBar;
