import axios from "axios";


const API = axios.create({
    baseURL: "http://127.0.0.1:8000"
});


export const getDashboard = async () => {

    const response = await API.get(
        "/dashboard/"
    );

    return response.data;
};


export const getAppliances = async () => {

    const response = await API.get(
        "/appliances/"
    );

    return response.data;
};


export const updateApplianceStatus = async (
    applianceId,
    status
) => {

    const response = await API.put(
        `/appliances/${applianceId}/status`,
        {
            status: status
        }
    );

    return response.data;
};


export const getDailyEnergy = async () => {

    const response = await API.get(
        "/energy/daily"
    );

    return response.data;
};


export const getApplianceEnergy = async () => {

    const response = await API.get(
        "/energy/appliances"
    );

    return response.data;
};


export const getBillPrediction = async () => {

    const response = await API.get(
        "/ai/bill-prediction"
    );

    return response.data;
};


export const getRecommendations = async () => {

    const response = await API.get(
        "/ai/recommendations"
    );

    return response.data;
};


export const getAnomalies = async () => {

    const response = await API.get(
        "/ai/anomalies"
    );

    return response.data;
};
export const getAlerts = async () => {

    const response = await API.get(
        "/ai/alerts"
    );

    return response.data;
};