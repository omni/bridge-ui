import React from 'react';

export const Events = () => (
  <div class="events-container">
    <h1 class="events-title">Events</h1>
    <div class="events">
      <div class="events-side events-side_left">
        <h1 class="events-title events-title_mobile">Poa network</h1>
        <input type="text" class="events-side-input" placeholder="Block Number ..." />
        <div class="events-i events-i_open">
          <div class="events-i-header">
            <div class="events-i-header-title">
              <p class="label green">Deposit</p>
              <a href="#">Show Сouple</a>
            </div>
            <p class="description break-all">
              tx: 0xdb6099042334280e83fa9e8e0bd3a5ed4ea9872dab7d26b04355e7722713fb86
            </p>
            <div class="events-i-switcher"></div>
          </div>
          <div class="events-i-body">
            <p class="label">Recepient</p>
            <p class="description break-all">
              0x39E5240a1cA2D0682e6cf2DDf14493301fb8c4dc
            </p>
            <p class="label">Recepient value</p>
            <p class="description break-all">
              30000000000000000000
            </p>
            <p class="label">Block number</p>
            <p class="description">
              6125425
            </p>
          </div>
        </div>
      </div>
      <div class="events-side events-side_right">
        <h1 class="events-title events-title_mobile">Ethereum network (kovan)</h1>
        <input type="text" class="events-side-input" placeholder="Block Number ..." />
        <div class="events-i">
          <div class="events-i-header">
            <div class="events-i-header-title">
              <p class="label purple">Seigned for deposit</p>
            </div>
            <p class="description break-all">
              tx: 0xdb6099042334280e83fa9e8e0bd3a5ed4ea9872dab7d26b04355e7722713fb86
            </p>
            <div class="events-i-switcher"></div>
          </div>
        </div>
        <div class="events-i">
          <div class="events-i-header">
            <div class="events-i-header-title">
              <p class="label red">Withdraw</p>
            </div>
            <p class="description break-all">
              tx: 0xdb6099042334280e83fa9e8e0bd3a5ed4ea9872dab7d26b04355e7722713fb86
            </p>
            <div class="events-i-switcher"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
