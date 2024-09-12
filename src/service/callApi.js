import axios from 'axios';
const url = 'http://localhost:5000'
// const url = 'http://18.141.186.46:5000'
// const url = 'https://long-goat-sneakers.cyclic.app'
// const url = 'https://backend-j2l4.onrender.com'
// 

async function callApi(method, endpoint, data) {
    try {
        let response;
        if (method === 'get') {
            response = await axios.get(url + endpoint, { params: data });
        } else if (method === 'post') {
            response = await axios.post(url + endpoint, data);
        } else if (method === 'patch') {
            response = await axios.patch(url + endpoint, data);
        } else if (method === 'delete') {
            response = await axios.delete(url + endpoint, data);
        }
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error; // รีเซ็ตเพื่อส่งข้อผิดพลาดไปยังผู้เรียก
    }
}
export default callApi;