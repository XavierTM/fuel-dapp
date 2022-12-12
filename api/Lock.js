


class Lock {


   acquire() {
      return new Promise(resolve => {
         this._add(resolve)
      });
   }

   _add(task) {

      this._list.push(task);

      if (!this._queueRunning)
         this._release();
   }

   _release() {
      

      this._queueRunning = true;

      const task = this._list.shift();

      if (!task) {
         this._queueRunning = false;
         return;
      }

      task(() => {
         this._release();
      });

   }

   constructor() {   
      this._list = [];
      this._queueRunning = false;
   }
}


module.exports = Lock;