import { createGlobalStyle } from 'styled-components';
import { colors, fonts } from './styleVars';

const GlobalStyle = createGlobalStyle`
  h1, h2, h3, h5, h6, button {
    font-family: ${fonts.montserrat};
  }
  
  .orangeText {
    color: ${colors.orange};
    font-weight: bold;
    font-family: ${fonts.lora};
  }

  .nav {
    color: ${colors.mainFont};
    font-size: 12px;
    letter-spacing: 0.84px;
    line-height: 15px;
  }

  .margin-team {
    margin-bottom: 50px;
    margin-top: 50px;
  }

  h1 {
    color: ${colors.secondaryFontColor};
    font-size: 48px;
    font-weight: 700;
    line-height: 56px;
  }

  h2 {
    color: ${colors.mainFont};
    font-size: 28px;
    font-weight: 700;
    line-height: 36px;
  }

  h3 {
    color: ${colors.mainFont};
    font-size: 24px;
    font-weight: 500;
    line-height: 56px;
  }

  h4 {
    color: ${colors.italicColor};
    font-family: ${fonts.lora};
    font-size: 24px;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0.01em;
    line-height: 28px;
  }

  h5 {
    font-size: 18px;
    font-weight: 500;
    line-height: 20px;
  }

  h6 {
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
  }

  p {
    font-family: ${fonts.mainFont};
    font-weight: 400;
    letter-spacing: 0.5px;
    line-height: 24px;
    font-size: 16px;
  }

  .button {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 16px;
  }

  .caption {
    font-family: ${fonts.mainFont};
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.4px;
    line-height: 14px;
  }

  .nav-link {
    align-self: center;
  }
`;

export default GlobalStyle;
