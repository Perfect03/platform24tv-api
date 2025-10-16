import type { IDevices, IAuth, IAccount } from '../types.js';
import { DEFAULT_HEADERS } from '../constants.js';
import { input } from 'azot';
import type { CoreContext } from '../../main.js';

export function createAuthModule(ctx: CoreContext) {
  return {
    async checkAuth() {
      if (!localStorage.getItem('access_token')) {
        await this.signIn();
        return;
      }

      const fetchAccount = await fetch(`${ctx.DOMAIN_API}/v2/users/self`, {
        headers: DEFAULT_HEADERS
      })

      if (fetchAccount?.status != 200) {
        console.error('Unauthorized');
        console.debug(await fetchAccount.text());
        return;
      }

      const account = await fetchAccount.json() as IAccount

      if (!account?.id) {
        console.debug(account);
        const user = await this.refresh()
        if (!user?.access_token) {
          this.signOut();
          await this.signIn();
        }
      }
    },
    async signIn() {
      console.debug(`Sign in ${ctx.DOMAIN_API}...`);

      const { answer: phone } = await input('Phone Number: ');

      const sendOTP = await fetch(ctx.DOMAIN_API+'/v2/otps', {
        body: JSON.stringify({
          can_display_message: false,
          phone: phone.trim().replace(/^\+/, '')
        }),
        method: 'POST',
        headers: DEFAULT_HEADERS
      })


      if (sendOTP?.status != 200) {
        console.error('Unable to send SMS code. Please check that your phone number is correct or try again later.');
        console.debug(await sendOTP.json());
        return;
      }

      const { answer: OTP } = await input('SMS code: ');

      const getAuth = await fetch(ctx.DOMAIN_API+'/v2/auth/otp', {
        body: JSON.stringify({
          token: OTP.trim(),
          phone: phone.trim().replace(/^\+/, '')
        }),
        method: 'POST',
        headers: DEFAULT_HEADERS
      })

      if (getAuth?.status != 200) {
        console.error('Unable to log in with provided credentials.');
        console.debug(await getAuth.json());
        return;
      }

      const profile = await getAuth.json() as IAuth;

      if (!profile?.access_token) {
        console.error('Unexpected Error. Please, try later.');
        console.debug(profile);
        return;
      }

      const devicesResponse = await fetch(`${ctx.DOMAIN_API}/v2/users/self/devices?access_token=${profile.access_token}`, {
        body: JSON.stringify({
          application_type: 'web',
          device_type: 'pc',
          os_name: 'Windows',
          os_version: '10',
          vendor: 'PC'
        }),
        method: 'POST',
        headers: DEFAULT_HEADERS
      });

      const deviceId = (await devicesResponse?.json() as IDevices)?.id;

      if (!deviceId) {
        console.error('Unexpected Error. Please, try later.');
        console.debug(await devicesResponse?.json())
        return;
      }

      localStorage.setItem('refresh_token', deviceId)

      const user = await this.refresh()

      return user;
    },
    async refresh() {
      console.debug('Refresh token...');
      const deviceResponse = await fetch(ctx.DOMAIN_API+'/v2/auth/device', {
        body: JSON.stringify({
          device_id: localStorage.getItem('refresh_token')
        }),
        method: 'POST',
        headers: DEFAULT_HEADERS
      });

      const profile = await deviceResponse.json() as IAuth;

      if (!profile?.access_token) {
        console.error('Authorization token update error. Please try signing in again.');
        console.debug(profile);
        this.signOut();
        await this.signIn();
        return;
      }
      localStorage.setItem('access_token', profile.access_token);

      return profile;
    },
    signOut() {
      localStorage.clear();
    }
  }
}
