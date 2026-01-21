import { loadWAFData,getTenant } from "../../utils/helpers";

export const fetchCsrfToken = async (securityContext1) => {
  try {
    const WAFData = await loadWAFData();
    console.log("Security Context is:", securityContext1);
    const tenant = await getTenant();
    const csrfURL = tenant + '/resources/v1/application/CSRF';

    const response = await new Promise((resolve, reject) => {
      WAFData.authenticatedRequest(csrfURL, {
        method: "GET",
        type: "json",
        onComplete: resolve,
        onFailure: reject,
      });
    });

    const csrfToken = response.csrf.name;
    const csrfValue = response.csrf.value;
    const securityContextHeader = "SecurityContext";
    const securityContextValue = securityContext1;

    const headers = {
      [csrfToken]: csrfValue,
      [securityContextHeader]: securityContextValue,
    };
    return headers;
  } catch (error) {
    console.error("[CSRF] Failed to fetch token:", error);
    return; 
  }
};
