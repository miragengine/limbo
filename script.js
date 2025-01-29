// UPDATED
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
	const bet_sound = new Audio('bet.mp3');
	const win_sound = new Audio('win.mp3');
	const tick_sound = new Audio('tick.mp3');
	const settings_button = document.querySelector('.footer-button');
	const settings_tooltip = document.getElementById('settings-tooltip');
	let toggle_state = true;

	const reset_button = document.getElementById("reset-win");
	const increase_by_button = document.getElementById("increase-by-button");
	const increase_input = document.getElementById("increase-win");

	const reset_loss_button = document.getElementById("reset-loss");
	const increase_by_loss_button = document.getElementById("increase-by-loss-button");
	const increase_loss_input = document.getElementById("increase-loss");

	increase_input.disabled = true;
	increase_loss_input.disabled = true;

	const manual_mode_button = document.querySelector('.mode-button:first-child');
	const auto_mode_button = document.querySelector('.mode-button:last-child');
	const manual_mode_container = document.getElementById('manual-mode-container');
	const auto_mode_container = document.getElementById('auto-mode-container');

	const auto_bet_button = document.getElementById("start-autobet");
	const num_bets_input = document.getElementById("num-bets");

	const stop_profit_input = document.getElementById("stop-profit");
	const stop_loss_input = document.getElementById("stop-loss");

	const history_list = document.getElementById('history-list');

	const live_stats = document.querySelector('.live-stats');
	const stats_header = document.querySelector('.stats-header');

	let is_dragging = false;
	let start_x, start_y, initial_x, initial_y;

	let total_profit = 0;

	let auto_bet_running = false;
	let auto_bet_interval;
	let bets_made = 0;
	let total_bets = Infinity;

	const stats = {
		profit: 0,
		wagered: 0,
		wins: 0,
		losses: 0
	};

	const profit_element = document.querySelector('.stat-value[data-stat="profit"]');
	const wagered_element = document.querySelector('.stat-value[data-stat="wagered"]');
	const wins_element = document.querySelector('.stat-value[data-stat="wins"]');
	const losses_element = document.querySelector('.stat-value[data-stat="losses"]');
	const refresh_stats_button = document.querySelector('.stats-refresh');

	function update_stats_ui() {
		if (stats.profit < 0) {
			profit_element.style.color = "#e34c4c";
			profit_element.textContent = `-$${Math.abs(stats.profit).toFixed(2)}`;
		} else {
			profit_element.style.color = "#00E701";
			profit_element.textContent = `$${stats.profit.toFixed(2)}`;
		}

		wagered_element.textContent = `$${stats.wagered.toFixed(2)}`;

		wins_element.textContent = stats.wins;
		wins_element.style.color = "#00E701";

		losses_element.textContent = stats.losses;
		losses_element.style.color = "#FF4D4D";
	}

	function reset_stats() {
		stats.profit = 0;
		stats.wagered = 0;
		stats.wins = 0;
		stats.losses = 0;
		update_stats_ui();
	}

	stats_header.addEventListener('mousedown', (event) => {
		is_dragging = true;
		start_x = event.clientX;
		start_y = event.clientY;

		const rect = live_stats.getBoundingClientRect();
		initial_x = rect.left;
		initial_y = rect.top;

		live_stats.style.transform = 'none';

		document.addEventListener('mousemove', on_drag);
		document.addEventListener('mouseup', stop_dragging);
	});

	function on_drag(event) {
		if (!is_dragging) return;

		const deltaX = event.clientX - start_x;
		const deltaY = event.clientY - start_y;

		live_stats.style.left = `${initial_x + deltaX}px`;
		live_stats.style.top = `${initial_y + deltaY}px`;
	}

	function stop_dragging() {
		is_dragging = false;
		document.removeEventListener('mousemove', on_drag);
		document.removeEventListener('mouseup', stop_dragging);
	}

	function switch_to_manual() {
		manual_mode_button.classList.add('active');
		auto_mode_button.classList.remove('active');
		manual_mode_container.style.display = 'block';
		auto_mode_container.style.display = 'none';

		disable_auto_mode_inputs();
	}

	function switch_to_auto() {
		auto_mode_button.classList.add('active');
		manual_mode_button.classList.remove('active');
		manual_mode_container.style.display = 'none';
		auto_mode_container.style.display = 'block';

		enable_auto_mode_inputs();
	}

	function enable_auto_mode_inputs() {
		reset_button.removeAttribute("disabled");
		increase_by_button.removeAttribute("disabled");
		reset_loss_button.removeAttribute("disabled");
		increase_by_loss_button.removeAttribute("disabled");
		stop_profit_input.removeAttribute("disabled");
		stop_loss_input.removeAttribute("disabled");

		if (increase_by_button.classList.contains("active")) {
			increase_input.removeAttribute("disabled");
		}
		if (increase_by_loss_button.classList.contains("active")) {
			increase_loss_input.removeAttribute("disabled");
		}
	}

	function disable_auto_mode_inputs() {
		reset_button.setAttribute("disabled", true);
		increase_by_button.setAttribute("disabled", true);
		increase_input.setAttribute("disabled", true);
		reset_loss_button.setAttribute("disabled", true);
		increase_by_loss_button.setAttribute("disabled", true);
		increase_loss_input.setAttribute("disabled", true);
		stop_profit_input.setAttribute("disabled", true);
		stop_loss_input.setAttribute("disabled", true);
	}

	reset_button.addEventListener("click", function() {
		reset_button.classList.add("active");
		increase_by_button.classList.remove("active");
		increase_input.disabled = true;
	});

	increase_by_button.addEventListener("click", function() {
		increase_by_button.classList.add("active");
		reset_button.classList.remove("active");
		increase_input.disabled = false;
	});

	reset_loss_button.addEventListener("click", function() {
		reset_loss_button.classList.add("active");
		increase_by_loss_button.classList.remove("active");
		increase_loss_input.disabled = true;
	});

	increase_by_loss_button.addEventListener("click", function() {
		increase_by_loss_button.classList.add("active");
		reset_loss_button.classList.remove("active");
		increase_loss_input.disabled = false;
	});

	if (toggle_state) {
		settings_tooltip.classList.add('active');
	}

	settings_button.addEventListener('click', (event) => {
		event.stopPropagation();
		settings_tooltip.classList.toggle('show');
	});

	function toggle_animation_state() {
		toggle_state = !toggle_state;
		if (toggle_state) {
			settings_tooltip.classList.add('active');
		} else {
			settings_tooltip.classList.remove('active');
		}
	}

	settings_tooltip.addEventListener('click', (event) => {
		event.stopPropagation();
		toggle_animation_state();
	});

	document.addEventListener('click', () => {
		settings_tooltip.classList.remove('show');
	});

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
			const current_balance = get_balance();
			const new_balance = current_balance + add_amount;
			set_balance(new_balance);
		}
		popup_overlay.style.display = 'none';
		add_amount_input.value = '';
	});

	let rolling = false;

	function set_balance(new_balance) {
		const formatted_balance = `$${new_balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
		balance_element.textContent = formatted_balance;
	}

	function get_balance() {
		const raw_balance = balance_element.textContent.replace(/[$,]/g, '');
		return parseFloat(raw_balance) || 0;
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
		update_bet(new_value <= balance ? new_value : balance);
	}

	function update_win_chance() {
		const target_multiplier = parseFloat(target_multiplier_input.value) || 1;
		win_chance_input.value = (99 / target_multiplier).toFixed(8);
		update_profit();
	}

	function update_target_multiplier() {
		const win_chance = parseFloat(win_chance_input.value) || 1;
		target_multiplier_input.value = (99 / win_chance).toFixed(2);
		update_profit();
	}

	function update_profit() {
		const bet_amount = get_bet_amount();
		const target_multiplier = parseFloat(target_multiplier_input.value) || 1;
		profit_input.value = (bet_amount * (target_multiplier - 1)).toFixed(2);
	}

	function roll_multiplier() {
		const random_value = Math.random();
		const multiplier = 1 / random_value;
		return Math.max(1.01, parseFloat(multiplier.toFixed(2)));
	}

	function add_game_result(multiplier, is_win) {
		const history_item = document.createElement('div');
		history_item.classList.add('history-item', is_win ? 'win' : 'loss');
		history_item.textContent = `${multiplier.toFixed(2)}×`;
		history_list.prepend(history_item);

		if (history_list.childNodes.length > 13) {
			history_list.removeChild(history_list.lastChild);
		}
	}

	function play_game() {
		if (rolling) return;
		rolling = true;
		bets_made++;

		if (total_bets !== Infinity) {
			const remaining_bets = total_bets - bets_made;
			num_bets_input.value = Math.max(remaining_bets, 0);
		}

		bet_button.disabled = true;
		bet_sound.play();

		const bet_amount = get_bet_amount();
		const balance = get_balance();
		const target_multiplier = parseFloat(target_multiplier_input.value) || 2.00;
		const default_bet_amount = parseFloat(bet_amount_input.getAttribute("data-default")) || bet_amount;

		if (bet_amount <= 0 || bet_amount > balance) {
			rolling = false;
			bet_button.disabled = false;
			stop_auto_bet();
			return;
		}

		set_balance(balance - bet_amount);
		stats.wagered += bet_amount;
		const rolled_multiplier = roll_multiplier(target_multiplier);
		const is_win = rolled_multiplier >= target_multiplier;

		animate_multiplier(rolled_multiplier, is_win, () => {
			if (is_win) {
				win_sound.currentTime = 0;
				win_sound.play();
				const profit = bet_amount * (target_multiplier - 1);
				total_profit += profit;
				stats.profit += profit;
				stats.wins++;
				set_balance(get_balance() + bet_amount * target_multiplier);

				if (auto_mode_button.classList.contains("active")) {
					const increase_win_percentage = parseFloat(increase_input.value) || 0;
					let new_bet_amount = default_bet_amount;

					if (reset_button.classList.contains("active")) {
						new_bet_amount = default_bet_amount;
					} else if (increase_by_button.classList.contains("active")) {
						new_bet_amount = bet_amount + (bet_amount * increase_win_percentage / 100);
					}

					bet_amount_input.value = new_bet_amount.toFixed(2);
					bet_amount_input.setAttribute("data-default", new_bet_amount);
				}
			} else {
				const loss = bet_amount;
				total_profit -= loss;
				stats.profit -= loss;
				stats.losses++;

				if (auto_mode_button.classList.contains("active")) {
					const increase_loss_percentage = parseFloat(increase_loss_input.value) || 0;
					let new_bet_amount = default_bet_amount;

					if (reset_loss_button.classList.contains("active")) {
						new_bet_amount = default_bet_amount;
					} else if (increase_by_loss_button.classList.contains("active")) {
						new_bet_amount = bet_amount + (bet_amount * increase_loss_percentage / 100);
					}

					bet_amount_input.value = new_bet_amount.toFixed(2);
					bet_amount_input.setAttribute("data-default", default_bet_amount);
				}
			}

			add_game_result(rolled_multiplier, is_win);
			update_stats_ui();

			rolling = false;
			bet_button.disabled = false;

			const stop_profit = parseFloat(stop_profit_input.value) || Infinity;
			const stop_loss = parseFloat(stop_loss_input.value) || Infinity;

			if (total_profit >= stop_profit) {
				stop_auto_bet();
			} else if (total_profit <= -stop_loss) {
				stop_auto_bet();
			}

			if (bets_made >= total_bets) stop_auto_bet();
		});
	}

	function start_auto_bet() {
		const input_bets = parseInt(num_bets_input.value, 10);

		if (!isNaN(input_bets) && input_bets > 0) {
			total_bets = input_bets;
		} else {
			total_bets = Infinity;
			num_bets_input.value = '';
		}

		auto_bet_running = true;
		bets_made = 0;
		auto_bet_button.textContent = "Stop Autobet";
		auto_bet_button.classList.add("active");

		auto_bet_interval = setInterval(play_game, 50);
	}

	function stop_auto_bet() {
		auto_bet_running = false;
		clearInterval(auto_bet_interval);
		auto_bet_button.textContent = "Start Autobet";
		auto_bet_button.classList.remove("active");
	}

	auto_bet_button.addEventListener("click", function() {
		if (auto_bet_running) {
			stop_auto_bet();
		} else {
			start_auto_bet();
		}
	});

	num_bets_input.addEventListener("input", function() {
		const input_bets = parseInt(num_bets_input.value, 10);
		if (!isNaN(input_bets) && input_bets > 0) {
			total_bets = input_bets;
		} else {
			total_bets = Infinity;
		}
	});


	function animate_multiplier(final_multiplier, is_win, callback) {
		let current_value = 1.01;
		const step = (final_multiplier - 1.01) / 23;

		if (!toggle_state) {
			multiplier_value_display.textContent = `${final_multiplier.toFixed(2)}×`;
			multiplier_value_display.style.color = is_win ? '#00E701' : '#E9113C';
			if (callback) callback();
			return;
		}

		multiplier_value_display.style.color = '#FFFFFF';
		const tickTimeout = setTimeout(() => {
			tick_sound.currentTime = 0;
			tick_sound.loop = true;
			tick_sound.volume = 0.5;
			tick_sound.play();
		}, 145);

		const interval = setInterval(() => {
			current_value += step;
			if (current_value >= final_multiplier) {
				clearInterval(interval);
				clearTimeout(tickTimeout);
				tick_sound.loop = false;
				tick_sound.pause();
				multiplier_value_display.textContent = `${final_multiplier.toFixed(2)}×`;
				multiplier_value_display.style.color = is_win ? '#00E701' : '#E9113C';
				if (callback) callback();
			} else {
				multiplier_value_display.textContent = `${current_value.toFixed(2)}×`;
			}
		}, 18);
	}

	half_button.addEventListener('click', half_bet);
	double_button.addEventListener('click', double_bet);
	target_multiplier_input.addEventListener('input', update_win_chance);
	win_chance_input.addEventListener('input', update_target_multiplier);
	bet_amount_input.addEventListener('input', update_profit);
	bet_button.addEventListener('click', play_game);

	manual_mode_button.addEventListener('click', switch_to_manual);
	auto_mode_button.addEventListener('click', switch_to_auto);
	refresh_stats_button.addEventListener('click', reset_stats);

	if (balance_element) {
		balance_element.textContent = '$100.00';
	}

	update_profit();
	switch_to_manual();
});
