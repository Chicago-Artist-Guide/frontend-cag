import React from 'react';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';

const PrivacyPolicy = () => (
  <Container>
    <Title>PRIVACY POLICY</Title>
    <Subtitle>Last updated May 24, 2023</Subtitle>

    <BodyText>
      This privacy notice for Chicago Artist Guide ("
      <strong>Company</strong>", "<strong>we</strong>", "<strong>us</strong>" or
      "<strong>our</strong>"), describes how and why we might collect, store,
      use, and/or share ("
      <strong>process</strong>") your information when you use our services ("
      <strong>Services</strong>"), such as when you:
    </BodyText>

    <ul
      style={{
        lineHeight: '1.5',
        fontSize: 15,
        color: 'rgb(127, 127, 127)',
        marginTop: 20
      }}
    >
      <li>
        Visit our website at{' '}
        <NavLink href="https://www.chicagoartistguide.org/" target="_blank">
          https://www.chicagoartistguide.org/
        </NavLink>
        , or any website of ours that links to this privacy notice
      </li>
      <li>
        Engage with us in other related ways, including any sales, marketing, or
        events
      </li>
    </ul>
    <div>
      <div style={{ color: 'rgb(127, 127, 127)' }}>
        <strong>Questions or concerns? </strong>Reading this privacy notice will
        help you understand your privacy rights and choices. If you do not agree
        with our policies and practices, please do not use our Services. If you
        still have any questions or concerns, please contact us at{' '}
        <a href="mailto:contact@chicagoartistguide.org">
          contact@chicagoartistguide.org
        </a>
        .
      </div>
      <Heading1>SUMMARY OF KEY POINTS</Heading1>
      <BodyText style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
        This summary provides key points from our privacy notice, but you can
        find out more details about any of these topics by clicking the link
        following each key point or by using our{' '}
        <NavLink href="#toc">
          <em>table of contents</em>
        </NavLink>{' '}
        below to find the section you are looking for.
      </BodyText>
      <BodyText>
        <strong>What personal information do we process?</strong> When you
        visit, use, or navigate our Services, we may process personal
        information depending on how you interact with Chicago Artist Guide and
        the Services, the choices you make, and the products and features you
        use. Learn more about{' '}
        <NavLink href="#personalinfo">
          personal information you disclose to us
        </NavLink>
      </BodyText>
      <BodyText>
        <strong>Do we process any sensitive personal information?</strong>
        We may process sensitive personal information when necessary with your
        consent or as otherwise permitted by applicable law. Learn more about{' '}
        <NavLink href="#sensitiveinfo">
          sensitive information we process
        </NavLink>
        .
      </BodyText>
      <BodyText>
        <strong>Do we receive any information from third parties?</strong>
        We do not receive any information from third parties.
      </BodyText>
      <BodyText>
        <strong>How do we process your information?</strong> We process your
        information to provide, improve, and administer our Services,
        communicate with you, for security and fraud prevention, and to comply
        with law. We may also process your information for other purposes with
        your consent. We process your information only when we have a valid
        legal reason to do so. Learn more about{' '}
        <NavLink href="#infouse">how we process your information</NavLink>.
      </BodyText>
      <BodyText>
        <strong>
          In what situations and with which parties do we share personal
          information?
        </strong>
        We may share information in specific situations and with specific third
        parties. Learn more about{' '}
        <NavLink href="#whoshare">
          when and with whom we share your personal information
        </NavLink>
        .{' '}
      </BodyText>
      <BodyText>
        <strong>How do we keep your information safe?</strong> We have
        organizational and technical processes and procedures in place to
        protect your personal information. However, no electronic transmission
        over the internet or information storage technology can be guaranteed to
        be 100% secure, so we cannot promise or guarantee that hackers,
        cybercriminals, or other unauthorized third parties will not be able to
        defeat our security and improperly collect, access, steal, or modify
        your information. Learn more about
        <NavLink href="#infosafe"> how we keep your information safe</NavLink>
      </BodyText>
      <BodyText>
        <strong>What are your rights?</strong> Depending on where you are
        located geographically, the applicable privacy law may mean you have
        certain rights regarding your personal information. Learn more about{' '}
        <NavLink href="#privacyrights">your privacy rights</NavLink>.
      </BodyText>
      <BodyText>
        <strong>How do you exercise your rights?</strong> The easiest way to
        exercise your rights is by submitting a{' '}
        <NavLink
          href="https://app.termly.io/notify/4851af35-e5a6-41ca-aee4-ff84ffe7a3f0"
          rel="noopener noreferrer"
          target="_blank"
        >
          data subject access request
        </NavLink>
        , or by contacting us. We will consider and act upon any request in
        accordance with applicable data protection laws.
      </BodyText>
      <BodyText>
        Want to learn more about what Chicago Artist Guide does with any
        information we collect?
        <NavLink href="#toc"> Review the privacy notice in full</NavLink>.
      </BodyText>
      <div id="toc">
        <Heading1>TABLE OF CONTENTS </Heading1>
      </div>
      <BodyText>
        <NavLink href="#infocollect">
          1. WHAT INFORMATION DO WE COLLECT?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#infouse">
          2. HOW DO WE PROCESS YOUR INFORMATION?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#whoshare">
          3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#inforetain">
          4. HOW LONG DO WE KEEP YOUR INFORMATION?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#infosafe">
          5. HOW DO WE KEEP YOUR INFORMATION SAFE?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#infominors">
          6. DO WE COLLECT INFORMATION FROM MINORS?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#privacyrights">
          7. WHAT ARE YOUR PRIVACY RIGHTS?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#DNT">8. CONTROLS FOR DO-NOT-TRACK FEATURES</NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#caresidents">
          9. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#policyupdates">
          10. DO WE MAKE UPDATES TO THIS NOTICE?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#contact">
          11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </NavLink>
      </BodyText>
      <BodyText>
        <NavLink href="#request">
          12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM
          YOU?
        </NavLink>
      </BodyText>
      <div id="infocollect">
        <Heading1 id="control">1. WHAT INFORMATION DO WE COLLECT?</Heading1>
      </div>
      <Heading2 id="personalinfo">
        Personal information you disclose to us
      </Heading2>
      <BodyText>
        <strong>
          <em>In Short: </em>
        </strong>
        <em>We collect personal information that you provide to us.</em>
      </BodyText>
      <BodyText>
        We collect personal information that you voluntarily provide to us when
        you register on the Services, express an interest in obtaining
        information about us or our products and Services, when you participate
        in activities on the Services, or otherwise when you contact us.
      </BodyText>
      <BodyText>
        <strong>Personal Information Provided by You.</strong> The personal
        information that we collect depends on the context of your interactions
        with us and the Services, the choices you make, and the products and
        features you use. The personal information we collect may include the
        following:
      </BodyText>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>names</li>
      </ul>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>usernames</li>
      </ul>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>passwords</li>
      </ul>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>email addresses</li>
      </ul>
      <BodyText id="sensitiveinfo">
        <strong>Sensitive Information.</strong>
        When necessary, with your consent or as otherwise permitted by
        applicable law, we process the following categories of sensitive
        information:
      </BodyText>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>information revealing race or ethnic origin</li>
      </ul>
      <BodyText>
        All personal information that you provide to us must be true, complete,
        and accurate, and you must notify us of any changes to such personal
        information.
      </BodyText>
      <Heading2>Information automatically collected</Heading2>
      <BodyText>
        <strong>
          <em>In Short: </em>
        </strong>
        <em>
          Some information — such as your Internet Protocol (IP) address and/or
          browser and device characteristics — is collected automatically when
          you visit our Services.
        </em>
      </BodyText>
      <BodyText>
        We automatically collect certain information when you visit, use, or
        navigate the Services. This information does not reveal your specific
        identity (like your name or contact information) but may include device
        and usage information, such as your IP address, browser and device
        characteristics, operating system, language preferences, referring URLs,
        device name, country, location, information about how and when you use
        our Services, and other technical information. This information is
        primarily needed to maintain the security and operation of our Services,
        and for our internal analytics and reporting purposes.
      </BodyText>
      <BodyText>The information we collect includes:</BodyText>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>
          <em>Log and Usage Data.</em> Log and usage data is service-related,
          diagnostic, usage, and performance information our servers
          automatically collect when you access or use our Services and which we
          record in log files. Depending on how you interact with us, this log
          data may include your IP address, device information, browser type,
          and settings and information about your activity in the Services such
          as the date/time stamps associated with your usage, pages and files
          viewed, searches, and other actions you take such as which features
          you use), device event information (such as system activity, error
          reports (sometimes called "crash dumps" ), and hardware settings).
        </li>
      </ul>
      <div id="infouse">
        <Heading1 id="control">2. HOW DO WE PROCESS YOUR INFORMATION?</Heading1>
      </div>

      <BodyText>
        <strong>
          <em>In Short: </em>
        </strong>
        <em>
          We process your information to provide, improve, and administer our
          Services, communicate with you, for security and fraud prevention, and
          to comply with law. We may also process your information for other
          purposes with your consent.
        </em>
      </BodyText>
      <BodyText>
        <strong>
          We process your personal information for a variety of reasons,
          depending on how you interact with our Services, including:
        </strong>
      </BodyText>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>
          <strong>
            To facilitate account creation and authentication and otherwise
            manage user accounts.
          </strong>
          We may process your information so you can create and log in to your
          account, as well as keep your account in working order.
        </li>
      </ul>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>
          <strong>
            To deliver and facilitate delivery of services to the user.{' '}
          </strong>
          We may process your information to provide you with the requested
          service.
        </li>
      </ul>
      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>
          <strong>
            To evaluate and improve our Services, products, marketing, and your
            experience.
          </strong>{' '}
          We may process your information when we believe it is necessary to
          identify usage trends, determine the effectiveness of our promotional
          campaigns, and to evaluate and improve our Services, products,
          marketing, and your experience.
        </li>
      </ul>

      <div id="whoshare">
        <Heading1 id="control">
          3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </Heading1>
      </div>

      <BodyText>
        <strong>
          <em>In Short: </em>
        </strong>
        <em>
          We may share information in specific situations described in this
          section and/or with the following third parties.
        </em>
      </BodyText>

      <BodyText>
        We may need to share your personal information in the following
        situations:
      </BodyText>

      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>
          <strong>Business Transfers.</strong> We may share or transfer your
          information in connection with, or during negotiations of, any merger,
          sale of company assets, financing, or acquisition of all or a portion
          of our business to another company.
        </li>
      </ul>

      <div id="inforetain">
        <Heading1 id="control">
          4. HOW LONG DO WE KEEP YOUR INFORMATION?
        </Heading1>
      </div>

      <BodyText>
        <strong>
          <em>In Short: </em>
        </strong>
        <em>
          We keep your information for as long as necessary to fulfill the
          purposes outlined in this privacy notice unless otherwise required by
          law.
        </em>
      </BodyText>

      <BodyText>
        We will only keep your personal information for as long as it is
        necessary for the purposes set out in this privacy notice, unless a
        longer retention period is required or permitted by law (such as tax,
        accounting, or other legal requirements). No purpose in this notice will
        require us keeping your personal information for longer than the period
        of time in which users have an account with us.
      </BodyText>

      <BodyText>
        When we have no ongoing legitimate business need to process your
        personal information, we will either delete or anonymize such
        information, or, if this is not possible (for example, because your
        personal information has been stored in backup archives), then we will
        securely store your personal information and isolate it from any further
        processing until deletion is possible.
      </BodyText>

      <div id="infosafe">
        <Heading1 id="control">
          5. HOW DO WE KEEP YOUR INFORMATION SAFE?
        </Heading1>
      </div>

      <BodyText
        style={{
          fontStyle: 'italic'
        }}
      >
        <strong>In Short: </strong>
        We aim to protect your personal information through a system of
        organizational and technical security measures.
      </BodyText>

      <BodyText>
        We have implemented appropriate and reasonable technical and
        organizational security measures designed to protect the security of any
        personal information we process. However, despite our safeguards and
        efforts to secure your information, no electronic transmission over the
        Internet or information storage technology can be guaranteed to be 100%
        secure, so we cannot promise or guarantee that hackers, cybercriminals,
        or other unauthorized third parties will not be able to defeat our
        security and improperly collect, access, steal, or modify your
        information. Although we will do our best to protect your personal
        information, transmission of personal information to and from our
        Services is at your own risk. You should only access the Services within
        a secure environment.
      </BodyText>

      <div id="infominors">
        <Heading1 id="control">
          6. DO WE COLLECT INFORMATION FROM MINORS?
        </Heading1>
      </div>

      <BodyText
        style={{
          fontStyle: 'italic'
        }}
      >
        <strong>In Short: </strong> We do not knowingly collect data from or
        market to children under 18 years of age .
      </BodyText>

      <BodyText>
        We do not knowingly solicit data from or market to children under 18
        years of age. By using the Services, you represent that you are at least
        18 or that you are the parent or guardian of such a minor and consent to
        such minor dependent’s use of the Services. If we learn that personal
        information from users less than 18 years of age has been collected, we
        will deactivate the account and take reasonable measures to promptly
        delete such data from our records. If you become aware of any data we
        may have collected from children under age 18, please contact us at{' '}
        <a href="mailto:contact@chicagoartistguide.org">
          contact@chicagoartistguide.org
        </a>
        .
      </BodyText>

      <div id="privacyrights">
        <Heading1 id="control">7. WHAT ARE YOUR PRIVACY RIGHTS?</Heading1>
      </div>

      <BodyText>
        <strong>
          <em>In Short: </em>
        </strong>
        <em>You may review, change, or terminate your account at any time.</em>
      </BodyText>

      <BodyText id="withdrawconsent">
        <strong>
          <u>Withdrawing your consent:</u>
        </strong>{' '}
        If we are relying on your consent to process your personal information,
        which may be express and/or implied consent depending on the applicable
        law, you have the right to withdraw your consent at any time. You can
        withdraw your consent at any time by contacting us by using the contact
        details provided in the section "
        <NavLink href="#contact">
          HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </NavLink>
        " below.
      </BodyText>

      <BodyText>
        However, please note that this will not affect the lawfulness of the
        processing before its withdrawal nor, when applicable law allows, will
        it affect the processing of your personal information conducted in
        reliance on lawful processing grounds other than consent.
      </BodyText>

      <BodyText>
        <strong>
          <u>Opting out of marketing and promotional communications:</u>
        </strong>
        You can unsubscribe from our marketing and promotional communications at
        any time by clicking on the unsubscribe link in the emails that we send,
        or by contacting us using the details provided in the section "
        <NavLink href="#contact">
          HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </NavLink>
        " below. You will then be removed from the marketing lists. However, we
        may still communicate with you — for example, to send you
        service-related messages that are necessary for the administration and
        use of your account, to respond to service requests, or for other
        non-marketing purposes.
      </BodyText>

      <Heading2>Account Information</Heading2>

      <BodyText>
        If you would at any time like to review or change the information in
        your account or terminate your account, you can:
      </BodyText>

      <ul
        style={{
          lineHeight: '1.5',
          fontSize: 15,
          color: 'rgb(127, 127, 127)',
          marginTop: 20
        }}
      >
        <li>Log in to your account settings and update your user account.</li>
        <li>Contact us using the contact information provided.</li>
      </ul>

      <BodyText>
        Upon your request to terminate your account, we will deactivate or
        delete your account and information from our active databases. However,
        we may retain some information in our files to prevent fraud,
        troubleshoot problems, assist with any investigations, enforce our legal
        terms and/or comply with applicable legal requirements.
      </BodyText>

      <BodyText>
        If you have questions or comments about your privacy rights, you may
        email us at{' '}
        <a href="mailto:contact@chicagoartistguide.org">
          contact@chicagoartistguide.org
        </a>{' '}
        .
      </BodyText>

      <div id="DNT">
        <Heading1 id="control">8. CONTROLS FOR DO-NOT-TRACK FEATURES</Heading1>
      </div>

      <BodyText>
        Most web browsers and some mobile operating systems and mobile
        applications include a Do-Not-Track ( "DNT" ) feature or setting you can
        activate to signal your privacy preference not to have data about your
        online browsing activities monitored and collected. At this stage no
        uniform technology standard for recognizing and implementing DNT signals
        has been finalized . As such, we do not currently respond to DNT browser
        signals or any other mechanism that automatically communicates your
        choice not to be tracked online. If a standard for online tracking is
        adopted that we must follow in the future, we will inform you about that
        practice in a revised version of this privacy notice.
      </BodyText>

      <div id="caresidents">
        <Heading1 id="control">
          9. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
        </Heading1>
      </div>

      <BodyText
        style={{
          fontStyle: 'italic'
        }}
      >
        <strong>In Short: </strong>
        Yes, if you are a resident of California, you are granted specific
        rights regarding access to your personal information.
      </BodyText>

      <BodyText>
        California Civil Code Section 1798.83, also known as the "Shine The
        Light" law, permits our users who are California residents to request
        and obtain from us, once a year and free of charge, information about
        categories of personal information (if any) we disclosed to third
        parties for direct marketing purposes and the names and addresses of all
        third parties with which we shared personal information in the
        immediately preceding calendar year. If you are a California resident
        and would like to make such a request, please submit your request in
        writing to us using the contact information provided below.
      </BodyText>

      <BodyText>
        If you are under 18 years of age, reside in California, and have a
        registered account with Services, you have the right to request removal
        of unwanted data that you publicly post on the Services. To request
        removal of such data, please contact us using the contact information
        provided below and include the email address associated with your
        account and a statement that you reside in California. We will make sure
        the data is not publicly displayed on the Services, but please be aware
        that the data may not be completely or comprehensively removed from all
        our systems (e.g. , backups, etc.).
      </BodyText>

      <div id="policyupdates">
        <Heading1>10. DO WE MAKE UPDATES TO THIS NOTICE?</Heading1>
      </div>

      <BodyText
        style={{
          fontStyle: 'italic'
        }}
      >
        <strong>In Short: </strong>
        Yes, we will update this notice as necessary to stay compliant with
        relevant laws.
      </BodyText>

      <BodyText>
        We may update this privacy notice from time to time. The updated version
        will be indicated by an updated "Revised" date and the updated version
        will be effective as soon as it is accessible. If we make material
        changes to this privacy notice, we may notify you either by prominently
        posting a notice of such changes or by directly sending you a
        notification. We encourage you to review this privacy notice frequently
        to be informed of how we are protecting your information.
      </BodyText>

      <div id="contact">
        <Heading1>11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</Heading1>
      </div>
      <BodyText>
        If you have questions or comments about this notice, you may email us at{' '}
        <a href="mailto:contact@chicagoartistguide.org">
          contact@chicagoartistguide.org
        </a>{' '}
        or contact us by post at:
      </BodyText>

      <div
        style={{
          marginTop: 20,
          fontSize: 15,
          color: 'rgb(89, 89, 89)'
        }}
      >
        <div>Chicago Artist Guide</div>
        <div>4814 N Damen Ave 212</div>
        <div>Chicago, IL 60625</div>
        United States
      </div>
      <Heading1>
        12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
      </Heading1>

      <BodyText>
        Based on the applicable laws of your country, you may have the right to
        request access to the personal information we collect from you, change
        that information, or delete it. To request to review, update, or delete
        your personal information, please reach out to us at{' '}
        <a href="mailto:contact@chicagoartistguide.org">
          contact@chicagoartistguide.org
        </a>
        .
      </BodyText>
    </div>
  </Container>
);

const Container = styled(PageContainer)`
  h3 {
    font-size: 20px;
  }
  background: transparent !important;
`;

const BodyText = styled.div`
  color: #595959 !important;
  font-size: 14px !important;
  margin-top: 20px;
`;

const Subtitle = styled.div`
  color: #595959 !important;
  font-size: 14px !important;
  font-weight: bold;
`;

const Heading1 = styled.div`
  font-size: 19px !important;
  color: #000000 !important;
  font-weight: bold;
  margin-top: 40px;
`;

const Heading2 = styled.div`
  font-size: 17px !important;
  color: #000000 !important;
  font-weight: bold;
  margin-top: 20px;
`;

const NavLink = styled.a`
  font-size: 14px !important;
  word-break: break-word !important;
`;

export default PrivacyPolicy;
