/** Lightweight capability profile used to scale non-essential visual effects. */
export function getDeviceProfile(environment = globalThis.navigator || {}) {
  const connection=environment.connection||environment.mozConnection||environment.webkitConnection;
  const cores=Number(environment.hardwareConcurrency)||8;
  const memory=Number(environment.deviceMemory)||8;
  const saveData=Boolean(connection?.saveData);
  return Object.freeze({lowPower:saveData||cores<=4||memory<=4,saveData,cores,memory});
}
