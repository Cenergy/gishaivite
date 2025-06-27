<template>
  <div class="item mt-8 flex relative lg:mt-0 lg:p-[0.4rem_0_1rem_calc(var(--section-gap)/2)]">
    <i
      class="flex items-center justify-center w-8 h-8 text-[var(--color-text)] dark:text-gray-200 lg:absolute lg:top-[calc(50%-25px)] lg:left-[-26px] lg:border lg:border-solid lg:border-[var(--color-border)] dark:border-gray-700 lg:bg-[var(--color-background)] dark:bg-gray-800 lg:rounded-lg lg:w-[50px] lg:h-[50px]"
    >
      <slot name="icon"></slot>
    </i>
    <div class="flex-1 ml-4">
      <h3 class="text-[1.2rem] font-medium mb-[0.4rem] text-[var(--color-heading)] dark:text-white">
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
    transition: border-color 0.3s;
  }

  .dark .item:before {
    border-left: 1px solid rgba(75, 85, 99, 0.5);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
    transition: border-color 0.3s;
  }

  .dark .item:after {
    border-left: 1px solid rgba(75, 85, 99, 0.5);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
