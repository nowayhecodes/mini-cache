import "reflect-metadata";
import { CACHE_MANAGER, Inject } from "@nestjs/common";

type Inject = (target: object, key: string | symbol, index?: number) => void;

export const MiniCache = (ttl = 10) => {
  const injectCache = Inject(CACHE_MANAGER);
  return function (
    target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    injectCache(target, "cache");
    const decoratedMethod = descriptor.value;
    const cacheKey = `${target.constructor.name}-${decoratedMethod?.name}`;

    descriptor.value = async function () {
      const cachedData = await this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await decoratedMethod.apply(this, arguments);
      this.cache.set(cacheKey, response, { ttl: ttl });
      return response;
    };
  };
};
