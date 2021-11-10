import React from 'react';
import styled from 'styled-components';
import { TitleThree } from '../layout/Titles';

const Mailchimp = () => (
  <div id="mc_embed_signup">
    <form
      action="https://chicagoartistguide.us6.list-manage.com/subscribe/post?u=5259e9388abb929652f950f67&amp;id=8117d0974f"
      className="validate"
      id="mc-embedded-subscribe-form"
      method="post"
      name="mc-embedded-subscribe-form"
      noValidate
      target="_blank"
    >
      <div id="mc_embed_signup_scroll">
        <TitleThreeCap className="margin-top">
          Join our email list to stay up-to-date with Chicago Artist Guide.
        </TitleThreeCap>
        <FormContainer>
          <div className="indicates-required">
            <span className="asterisk">*</span> indicates required
          </div>
          <div className="mc-field-group">
            <label htmlFor="mce-FNAME">First Name </label>
            <input className="" id="mce-FNAME" name="FNAME" type="text" />
          </div>
          <div className="mc-field-group">
            <label htmlFor="mce-LNAME">Last Name </label>
            <input className="" id="mce-LNAME" name="LNAME" type="text" />
          </div>
          <div className="mc-field-group">
            <label htmlFor="mce-EMAIL">
              Email Address <span className="asterisk">*</span>
            </label>
            <input
              className="required email"
              id="mce-EMAIL"
              name="EMAIL"
              type="email"
            />
          </div>
          <div className="mc-field-group">
            <label htmlFor="mce-MMERGE3">Title </label>
            <input className="" id="mce-MMERGE3" name="MMERGE3" type="text" />
          </div>
          <div className="mc-field-group">
            <label htmlFor="mce-MMERGE4">Pronouns </label>
            <input className="" id="mce-MMERGE4" name="MMERGE4" type="text" />
          </div>
          <div className="mc-field-group">
            <label htmlFor="mce-MMERGE5">Work Email </label>
            <input className="" id="mce-MMERGE5" name="MMERGE5" type="text" />
          </div>
          <div className="mc-field-group size1of2">
            <label htmlFor="mce-MMERGE6">Phone Number </label>
            <input className="" id="mce-MMERGE6" name="MMERGE6" type="text" />
          </div>
          <div className="mc-field-group input-group">
            <strong>I am a: </strong>
            <ul>
              <li>
                <input
                  id="mce-group[24473]-24473-0"
                  name="group[24473][1]"
                  type="checkbox"
                  value="1"
                />
                <label htmlFor="mce-group[24473]-24473-0">Artist</label>
              </li>
              <li>
                <input
                  id="mce-group[24473]-24473-1"
                  name="group[24473][2]"
                  type="checkbox"
                  value="2"
                />
                <label htmlFor="mce-group[24473]-24473-1">Theater Staff</label>
              </li>
              <li>
                <input
                  id="mce-group[24473]-24473-2"
                  name="group[24473][4]"
                  type="checkbox"
                  value="4"
                />
                <label htmlFor="mce-group[24473]-24473-2">Supporter</label>
              </li>
            </ul>
          </div>
          <div className="mc-field-group input-group">
            <strong>I would like to receive updates about: </strong>
            <ul>
              <li>
                <input
                  id="mce-group[24477]-24477-0"
                  name="group[24477][8]"
                  type="checkbox"
                  value="8"
                />
                <label htmlFor="mce-group[24477]-24477-0">
                  Platform Information
                </label>
              </li>
              <li>
                <input
                  id="mce-group[24477]-24477-1"
                  name="group[24477][16]"
                  type="checkbox"
                  value="16"
                />
                <label htmlFor="mce-group[24477]-24477-1">
                  Community News and Updates
                </label>
              </li>
            </ul>
          </div>
          <div className="clear foot" id="mce-responses">
            <div
              className="response"
              id="mce-error-response"
              style={{ display: 'none' }}
            ></div>
            <div
              className="response"
              id="mce-success-response"
              style={{ display: 'none' }}
            ></div>
          </div>
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: '-5000px' }}
          >
            <input
              name="b_5259e9388abb929652f950f67_8117d0974f"
              tabIndex={-1}
              type="text"
            />
          </div>
          <div className="optionalParent">
            <div className="clear foot">
              <input
                className="button"
                id="mc-embedded-subscribe"
                name="subscribe"
                type="submit"
                value="Subscribe"
              />
              <p className="brandingLogo">
                <a
                  href="http://eepurl.com/hL96Tb"
                  title="Mailchimp - email marketing made easy and fun"
                >
                  <img
                    alt="Mailchimp logo"
                    src="https://eep.io/mc-cdn-images/template_images/branding_logo_text_dark_dtp.svg"
                  />
                </a>
              </p>
            </div>
          </div>
        </FormContainer>
      </div>
    </form>
  </div>
);

const TitleThreeCap = styled(TitleThree)`
  text-align: center;
  text-transform: uppercase;
`;

const FormContainer = styled.div`
  margin: 0 auto;
  width: 65%;

  .mc-field-group {
    flex-direction: column;

    strong {
      display: block;
      padding-bottom: 8px;
    }
  }

  input[type="checkbox"] {
    margin-right: 8px;
  }
`;

export default Mailchimp;
