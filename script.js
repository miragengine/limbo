document.addEventListener('DOMContentLoaded', function() {
    const bet_amount_input = document.getElementById('bet-amount');
    const balance_element = document.querySelector('.balance');
    const half_button = document.getElementById('half-button');
    const double_button = document.getElementById('double-button');
    const target_multiplier_input = document.getElementById('target-multiplier');
    const win_chance_input = document.getElementById('win-chance');
    const profit_input = document.getElementById('profit-on-win');
    const bet_button = document.querySelector('.bet-button');
    const multiplier_value_display = document.querySelector('.multiplier-value');

    const wallet_button = document.querySelector('.wallet-button');
    const popup_overlay = document.getElementById('popup-overlay');
    const add_button = document.getElementById('add-button');
    const add_amount_input = document.getElementById('add-amount');

    wallet_button.addEventListener('click', () => {
        popup_overlay.style.display = 'flex';
    });

    popup_overlay.addEventListener('click', (event) => {
        if (event.target === popup_overlay) {
            popup_overlay.style.display = 'none';
        }
    });

    add_button.addEventListener('click', () => {
        const add_amount = parseFloat(add_amount_input.value) || 0;
        if (add_amount > 0) {
            const current_balance = parseFloat(balance_element.textContent.replace('$', '')) || 0;
            const new_balance = current_balance + add_amount;
            balance_element.textContent = `$${new_balance.toFixed(2)}`;
        }
        popup_overlay.style.display = 'none';
        add_amount_input.value = '';
    });

    let rolling = false;

    function get_balance() {
        return parseFloat(balance_element.textContent.replace('$', '')) || 0;
    }

    function set_balance(new_balance) {
        balance_element.textContent = `$${new_balance.toFixed(2)}`;
    }

    function get_bet_amount() {
        return parseFloat(bet_amount_input.value) || 0;
    }

    function update_bet(amount) {
        if (amount < 0) amount = 0;
        bet_amount_input.value = amount.toFixed(2);
        update_profit();
    }

    function half_bet() {
        const current_value = get_bet_amount();
        const new_value = current_value / 2;
        update_bet(new_value);
    }

    function double_bet() {
        const current_value = get_bet_amount();
        const balance = get_balance();
        const new_value = current_value * 2;

        if (new_value <= balance) {
            update_bet(new_value);
        } else {
            update_bet(balance);
        }
    }

    function update_win_chance() {
        const target_multiplier = parseFloat(target_multiplier_input.value) || 1;
        const win_chance = (99 / target_multiplier).toFixed(8);
        win_chance_input.value = win_chance;
        update_profit();
    }

    function update_target_multiplier() {
        const win_chance = parseFloat(win_chance_input.value) || 1;
        const target_multiplier = (99 / win_chance).toFixed(2);
        target_multiplier_input.value = target_multiplier;
        update_profit();
    }

    function update_profit() {
        const bet_amount = get_bet_amount();
        const target_multiplier = parseFloat(target_multiplier_input.value) || 1;
        const profit = bet_amount * (target_multiplier - 1);
        profit_input.value = profit.toFixed(8);
    }

    function roll_multiplier(target_multiplier) {
        const random_multiplier = (1 / (Math.random() * 0.99 + 0.01)).toFixed(2);
        return Math.max(1.01, parseFloat(random_multiplier));
    }

    function animate_multiplier(final_multiplier, is_win) {
        let current_value = 1.01;
        const step = (final_multiplier - 1.01) / 15;
        rolling = true;

        multiplier_value_display.style.color = '#FFFFFF';

        const interval = setInterval(() => {
            current_value += step;
            if (current_value >= final_multiplier) {
                clearInterval(interval);
                multiplier_value_display.textContent = `${final_multiplier.toFixed(2)}×`;
                multiplier_value_display.style.color = is_win ? '#00E701' : '#E9113C';
                rolling = false;
            } else {
                multiplier_value_display.textContent = `${current_value.toFixed(2)}×`;
            }
        }, 18);
    }

    function play_game() {
        if (rolling) return;

        const bet_amount = get_bet_amount();
        const balance = get_balance();
        const target_multiplier = parseFloat(target_multiplier_input.value) || 2.00;

        if (bet_amount <= 0 || bet_amount > balance) {
            return;
        }

        set_balance(balance - bet_amount);
        const rolled_multiplier = roll_multiplier(target_multiplier);
        const is_win = rolled_multiplier >= target_multiplier;

        animate_multiplier(rolled_multiplier, is_win);

        setTimeout(() => {
            if (is_win) {
                const winnings = bet_amount * target_multiplier;
                set_balance(get_balance() + winnings);
            }
        }, 900);
    }

    half_button.addEventListener('click', half_bet);
    double_button.addEventListener('click', double_bet);
    target_multiplier_input.addEventListener('input', update_win_chance);
    win_chance_input.addEventListener('input', update_target_multiplier);
    bet_amount_input.addEventListener('input', update_profit);
    bet_button.addEventListener('click', play_game);

    if (balance_element) {
        balance_element.textContent = '$50.00';
    }

    update_profit();
});