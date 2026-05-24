export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setDefaultResultOrder } = await import('dns');
    setDefaultResultOrder('ipv4first');
  }
}
