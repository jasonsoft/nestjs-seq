/**
 * Represents a dynamic collection of events that supports various operations like addition,
 * removal, retrieval, and clearing of events.
 * Added by Jason.Song (成长的小猪) on 2023/11/17 16:50:14
 */
export class EventCollection<T> {
  private collection: T[] = [];

  /**
   * Adds an event to the collection.
   * @param event The event to add.
   */
  public add(event: T) {
    this.collection.push(event);
  }

  /**
   * Removes an event from the collection.
   * @param event The event or index to remove.
   */
  public remove(event: T | number) {
    const index =
      typeof event === 'number' ? event : this.collection.indexOf(event);
    if (index >= 0 && index < this.collection.length) {
      this.collection.splice(index, 1);
    }
  }

  /**
   * Retrieves the event at the specified index.
   * @param index The index of the event to retrieve.
   * @returns The event at the specified index.
   */
  public get(index: number): T {
    return this.collection[index];
  }

  /**
   * Returns the number of events in the collection.
   * @returns The number of events.
   */
  public size(): number {
    return this.collection.length;
  }

  /**
   * Clears all events from the collection.
   */
  public clear() {
    this.collection = [];
  }
}
