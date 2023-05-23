const baseUrl = 'https://ferm.fao.org'; // TODO pu in a config file

function submittedForReview(groupAdminEmails, institutionName, projectId, projectName) {
    const link = `${baseUrl}/registry/initiatives/${projectId}/general`;
    return {
        to: groupAdminEmails,
        message: {
            subject: `Review Request for Newly Submitted Initiative "${projectName}"`,
            html: `
                <p>Dear Administrators of ${institutionName},</p>
        
                <p>We hope this message finds you well.</p>
                
                <p>We wish to inform you that a new initiative, titled "${projectName}", affiliated with your institution has been submitted for review on the FERM Registry. As the designated administrators, your role is integral in upholding the quality and integrity of the data within our platform.</p>
                
                <p>When reviewing this newly submitted initiative, please ensure the following:</p>
                
                <ul>
                    <li>All mandatory fields have been completed.</li>
                    <li>The quality of the supplied data meets our standards.</li>
                    <li>The information is accurate and properly formatted.</li>
                    <li>Once you have verified these criteria, you may approve the initiative for publication by selecting the 'Publish' button.</li>
                </ul>
                
                <p>To review this initiative directly, please follow this link: <a href="${link}"></a>${link}.</p>
                
                <p>Your attention to this matter is highly appreciated. Should you have any questions or require further assistance, please feel free to reach out to us at ferm-support@fao.org.</p>
                
                <p>Thank you for your diligence in maintaining the excellence of our shared FERM Registry.</p>
                
                <p>Best regards,</p>
                
                <p>The FERM Team</p>
                `;
        }
    }
}