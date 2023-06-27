const baseUrl = process.env.NODE_ENV === 'production' ? 'https://ferm.fao.org' : 'http://localhost:5173';

/************************************************
 *
 * PROJECT PUBLISHING WORKFLOW
 *
 * **********************************************/

exports.initiativeSubmittedForReview = function(emails, groupName, projectId, projectTitle) {
    return {
        to: emails,
        message: {
            subject: `Review Request for Newly Submitted Initiative "${groupName}"`,
            html: `
            <p>Dear Administrators of ${groupName},</p>
            
            <p>
              I write to inform you that a new initiative, titled ${projectTitle}, associated with your institution, has been submitted for review on the FERM Registry. As the appointed administrators for ${groupName}, you play a pivotal role in maintaining the data quality and integrity of our platform.
            </p>
            
            <p>
              We kindly request you to review "${projectTitle}" by ensuring that:            
              <ol>
                  <li>All mandatory fields have been sufficiently completed.</li>
                  <li>The quality of the supplied data meets our platform's standards.</li>
                  <li>The information provided is both accurate and properly formatted.</li>
              </ol>
            </p>
            
            <p>
              Upon confirming that these criteria are met, you may proceed to publish the initiative by clicking on the 'Publish' button.
            </p>
            
            <p>
              You may directly review "${projectTitle}" by following this link: <a href="${baseUrl}/registry/initiatives/${projectId}">${baseUrl}/registry/initiatives/${projectId}</a>.
            </p>
            
            <p>
              We highly appreciate your attention to this matter. Should you need any assistance or have any queries, please do not hesitate to reach out to us at ferm-support@fao.org.
            </p>
            
            <p>
              Thank you for your diligent contribution to the excellence of our shared FERM Registry.
            </p>
            
            <p>Best regards,</p>
                
            <p>The FERM Team<br>
            <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
        `
        }
    };
};

exports.initiativeSubmittedForReviewSuperAdmins = function(emails, groupName, projectId, projectTitle) {
  return {
    to: emails,
    message: {
      subject: `Review Request for Newly Submitted Initiative "${groupName}"`,
      html: `
      <p>Dear Super Administrators,</p>

      <p>We are reaching out to you as Super Administrators because ${groupName} currently has no appointed administrators. A new initiative, titled ${projectTitle}, has been submitted for review on the FERM Registry. The initiative is associated with the institution ${groupName}. In the absence of assigned administrators for this institution, we kindly ask for your assistance to maintain the data quality and integrity of our platform.</p>
      
      <p>We need your help to review "${projectTitle}" by ensuring that:</p>          
      <ol>
        <li>All mandatory fields have been sufficiently completed.</li>
        <li>The quality of the supplied data meets our platform's standards.</li>
        <li>The information provided is both accurate and properly formatted.</li>
      </ol>
      
      <p>Upon confirming that these criteria are met, you may proceed to publish the initiative by clicking on the 'Publish' button.</p>
      
      <p>You may directly review "${projectTitle}" by following this link: <a href="${baseUrl}/registry/initiatives/${projectId}">${baseUrl}/registry/initiatives/${projectId}</a>.</p>
      
      <p>We highly appreciate your attention to this matter. Should you need any assistance or have any queries, please do not hesitate to reach out to us at ferm-support@fao.org.</p>
      
      <p>Your assistance in this matter ensures the smooth operation and excellence of our shared FERM Registry. Thank you for your continued support and diligence.</p>
      
      <p>Best regards,</p>
                
      <p>The FERM Team<br>
      <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
`
    }
  };
};

exports.initiativePublished = function(emails, groupName, projectId, projectTitle, ownerName, publicationTime) {
    const publicationTimeStr = publicationTime.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

    return {
        to: emails,
        message: {
            subject: `Your Initiative has been Published!`,
            html: `
                <p>Dear ${ownerName},</p>

                <p>
                    We are writing to inform you that your initiative, titled "${projectTitle}", has been reviewed and published on the
                    FERM Registry. This is an important step in making your work accessible to a wider audience and showcasing its value
                    to the community.
                </p>
            
                <p>
                    Your initiative has successfully met our platform's standards for publication, thanks to the efforts of our dedicated
                    team of administrators. It is now available for exploration and engagement by stakeholders interested in your field.
                </p>
            
                <p>
                    Here are some key details about your published initiative:
                </p>
            
                <ul>
                    <li><strong>Initiative Title:</strong> ${projectTitle}</li>
                    <li><strong>Publication Date:</strong> ${publicationTimeStr}</li>
                </ul>
            
                <p>
                    Feel free to share this exciting news with your colleagues, partners, and stakeholders. They can directly access your
                    initiative by following this link:
                    <a href="${baseUrl}/registry/initiatives/${projectId}">${baseUrl}/registry/initiatives/${projectId}</a>.
                </p>
            
                <p>
                    Please note that once an initiative is published, any updates or changes require a review process. If you need to
                    make modifications or additions, kindly contact our support team at <a href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>.
                    They will guide you through the necessary steps.
                </p>
            
                <p>
                    We would like to express our appreciation for your valuable contribution to the FERM Registry. Your initiative plays
                    a crucial role in promoting sustainable practices and driving positive change in your field.
                </p>
            
                <p>
                    Should you have any questions or require further assistance, please do not hesitate to reach out. We are here to
                    support you throughout your journey on the FERM platform.
                </p>
            
                <p>
                    Once again, congratulations on the publication of your initiative! We are excited to witness its impact within our
                    community.
                </p>
            
                <p>Best regards,</p>
                
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `
        }
    }
}

exports.initiativeRejected = function(emails, groupName, projectId, projectTitle, ownerName, reason) {
    return {
        to: emails,
        message: {
            subject: `Notification: Rejection of Your Submitted Initiative`,
            html: `
                <p>Dear ${ownerName},</p>
                <p>We hope this message finds you well. We regret to inform you that your submitted initiative, titled "<strong>${projectTitle}</strong>," has been reviewed by our administrators and has been rejected for publication on the FERM Registry.</p>
                <p>Please note the following reasons for the rejection as provided by the administrator:</p>
                <p><strong>Reason for Rejection:</strong><br>
                <span style="white-space: pre-wrap;font-style: italic;">${reason}</span></p>
                <p>We understand that this news may be disappointing. However, we encourage you to revise and improve your initiative based on the feedback provided. You can make the necessary adjustments by accessing your initiative through your FERM Registry account.</p>
                <p>If you have any questions or require further assistance, please don't hesitate to reach out to our support team at <a href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>. We are here to assist you in enhancing the quality and impact of your initiative.</p>
                <p>Thank you for your understanding and your continued commitment to the FERM Registry. We appreciate your efforts and encourage you to submit future initiatives that align with our platform's guidelines.</p>
                <p>Best regards,</p>
                
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `
        }
    }
}



exports.newGroupRequest = function(emails, name, displayName, type, otherType, partner, actor, flagship, description, website) {
    return {
        to: emails,
        message: {
            subject: `New group request for group ${name}`,
            html: `
                <p>Hi,</p>
                <p>User ${displayName} has requested to create a new group ${name}:</p>
                
                <p>
                    Name of the group: ${name}
                    <br>
                    Type of the group: ${type} ${type === 'Other' ? ' - Other type: ' + otherType : ''}
                </p>
                <p>
                    ${partner ? 'UN Decade partner<br>' : ''}
                    ${actor ? 'UN Decade actor<br>' : ''}
                    ${flagship ? 'Global Flagship' : ''}
                </p>

                <p>Description: <span style="font-style: italic;">${description}</span></p>
                <p>Website: ${website}</p>

                <p>As a superadmin, please go to <a href="${baseUrl}/admin/newGroups">${baseUrl}/admin/newGroups</a> to create the new group.</p>

                <p>Best regards,</p>
                
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `
        }
    };
}

exports.newGroupApproval = function(email, displayName, institutionName) {
    return {
        to: email,
        message: {
            subject: `Your request to create a new group ${institutionName} has been approved`,
            html: `
                <p>Dear ${displayName || email},</p>

                <p>We're writing to inform you that your proposal to create the new institution, 
                <strong>${institutionName}</strong>, has been accepted. This acceptance is a clear indication 
                of our belief in the vision and mission you have outlined for this cause. We're eager to see 
                how <strong>${institutionName}</strong> will contribute to our shared objective of 
                restoration and environmental conservation.</p>

                <p>With this approval, you now have full access to manage your institution, engage with our 
                community, share your initiatives, and invite others to join in your efforts. </p>

                <p>To manage your institution, please visit the <a href="${baseUrl}/initiatives">Framework for Ecosystem Restoration Monitoring</a>.</p>


                <p>Should you need any guidance or have any questions, our support team is available and 
                ready to assist you. Please don't hesitate to contact us at 
                <a href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>.</p>

                <p>Best regards,</p>
                
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>

            `
        }
    };
}

exports.newGroupRejection = function(email, displayName, institutionName) {
    return {
        to: email,
        message: {
            subject: `Your request to create a new group ${institutionName} has been rejected`,
            html: `
                <body>

                <p>Dear ${displayName || email},</p>

                <p>Thank you for your interest in creating a new institution, <strong${institutionName}</strong>, 
                within our restoration community. We value your commitment and the initiative you have shown 
                towards our shared goal of environmental conservation.</p>

                <p>After careful review, we regret to inform you that we are unable to approve the creation 
                of <strong>${institutionName}</strong> at this time. This decision was made based on several 
                criteria that we use to evaluate new institutions.</p>

                <p>We understand that this news may be disappointing, and we want to assure you that this 
                decision is not a reflection of the value we place on your efforts. Each proposal is unique 
                and is evaluated on its own merits, and while <strong>${institutionName}</strong> may not 
                have met our criteria at this time, we encourage you to continue your involvement in our 
                community and the cause of restoration.</p>

                <p>If you have any questions or wish to receive feedback about the decision, please feel free 
                to contact us at <a href="mailto:ferm-support@fao.org">mailto:ferm-support@fao.org</a>. 
                We're here to assist you and answer any queries you may have.</p>

                <p>We truly appreciate your understanding and your continued support of our collective 
                restoration efforts. We look forward to your future contributions within our community.</p>

                <p>Best regards,</p>
                
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `
        }
    };
}