// Reads "exp" from a JWT without verifying the signature

export function isTokenExpired(token: string): boolean {
    try{
        const payload = token.split(".")[1];
        if(!payload) return true;
        const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
        const {exp } = JSON.parse(atob(padded)) as {exp: number};
        if(!exp) return true;

        return Date.now() >= exp * 1000 - 30000;
    }catch{
        return true;
    }
}