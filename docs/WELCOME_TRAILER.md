# Additional welcome trailer

The configured trailer is https://youtu.be/FnErC0S9F2k (`welcomeTrailer.ts`). It does not replace recruitment cinematics. The existing local scene serves as the preview; no YouTube request is made until the viewer chooses Play trailer. Closing unmounts the iframe. Native dialog provides modal background isolation and keyboard navigation.

English and Spanish messages use the supplied copy. Quechua and Norwegian explicitly use English pending native linguistic validation.

Before production publication, the site owner must designate the child-directed website with Google's tools, even for youtube-nocookie embeds: https://support.google.com/youtube/answer/171780 and https://support.google.com/policies/answer/9664901 . This is an account/site-owner step, not a player URL parameter. Check the uploaded video's audience setting and embedding permission in YouTube Studio. No private credentials or MP4 are included.

The player keeps native controls and does not autoplay. An external YouTube link remains available if embedding is unavailable. Actual playback depends on YouTube and the upload's embedding settings.

QA: desktop 1440×900, tablet 768×1024 and mobile 390×844 captures are in docs/qa/trailer-*.png. Browser checks confirmed zero YouTube resources before playback, no iframe in the preview, focus initially on Close, keyboard navigation inside the native dialog, Escape dismissal, trigger focus restoration, iframe removal on close, EN/ES changes, and Play entering the existing illustrated introduction. The embed URL loads on demand; actual video playback could not be confirmed in the automated browser (the remote frame returned no visible player text).
