export class LoginResponseDto {
  message: string;
  data: {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      last_login_device: {
        device_browser: string;
        device_browser_version: string;
        device_os: string;
        device_os_version: string;
        device_type: string;
        device_brand: string;
        device_model: string;
      };
    };
    session_id: string;
  };
  access_token: string;
}
