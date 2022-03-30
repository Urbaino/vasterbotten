import fsp from 'fs/promises'
import path from 'path'

export class FileService {
    public static async readFromFile<T>(dir: string, filename: string): Promise<T> {
        try {
            const file = await fsp.readFile(path.join(dir, filename), { encoding: 'utf8' })
            return file as unknown as T;
        }
        catch (error) {
            throw error
        }
    }

    public static async saveToFile<T>(dir: string, filename: string, data: T) {
        await fsp.writeFile(path.join(dir, filename), JSON.stringify(data));
    }
}