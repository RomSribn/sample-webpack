import { Env } from '../env';

export async function get_app_list(env: Env) {
	return env.ze_app_list.list();
}
