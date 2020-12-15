import React from 'react';
import Holder1 from '../holder-1';
import Yellow_Blob_2 from '../../../images/yellow_blob_2.svg'
import Dancer from '../../../images/wwww-3.svg'

function PrivacyStatement() {
  return (
      <Holder1 
      greeting="Hi, First Name!"
      title="LET'S TALK PRIVACY"
      tagline="Your privacy is our top concern. Always."
      comp={<p>
        We understand how important your privacy is to you…. 
        Agreement page before this about ethical casting and inclusion vs exclusion filters. 
        Explain the info buttons to find out more about fields. Link to FAQs. 
        You can always change your selections in your Profile settings. Anything “displayed” is viewable on your profile. 
        Anything “not displayed” will only be viewable if used for a specific casting notice.  
        </p>}
        blob={Yellow_Blob_2}
        dancer={Dancer}
      />
  )
}

export default PrivacyStatement;