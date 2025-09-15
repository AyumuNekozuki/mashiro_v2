// リクエストキュー管理
// OpenAI APIへの同時リクエストを制限してレート制限を回避

class RequestQueue {
  constructor(maxConcurrent = 2, minInterval = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.minInterval = minInterval;
    this.queue = [];
    this.active = 0;
    this.lastRequestTime = 0;
  }

  async add(requestFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFunction,
        resolve,
        reject
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { requestFunction, resolve, reject } = this.queue.shift();
    this.active++;

    try {
      // 最小間隔の確保
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      const result = await requestFunction();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.active--;
      // 次のリクエストを処理
      setImmediate(() => this.processQueue());
    }
  }
}

// シングルトンインスタンス
const requestQueue = new RequestQueue(2, 1000); // 最大2つの同時リクエスト、1秒間隔

export default requestQueue;
