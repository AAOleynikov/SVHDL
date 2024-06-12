library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity ct is
	port(
		not_S : in STD_LOGIC;
		not_R : in STD_LOGIC;
		Bx : in STD_LOGIC;
		out_Q1 : out STD_LOGIC;
		out_not_Q1 : out STD_LOGIC;
		out_Q2 : out STD_LOGIC;
		out_not_Q2 : out STD_LOGIC;
		out_Q3 : out STD_LOGIC;
		out_not_Q3 : out STD_LOGIC;
		out_Q4 : out STD_LOGIC;
		out_not_Q4 : out STD_LOGIC
	);
end ct;

architecture ct of ct is
	component jk_with_polar_control
		port(
			not_S : in STD_LOGIC;
			J : in STD_LOGIC;
			C : in STD_LOGIC;
			K : in STD_LOGIC;
			not_R : in STD_LOGIC;
			Q : out STD_LOGIC;
			not_Q : out STD_LOGIC
		); 
	end component;
	component or_2
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component and_2
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component and_3
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			x3 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	signal Q1, not_Q1, Q2, not_Q2, Q3, not_Q3, Q4, not_Q4, Q5, Q6, Q7, Q8 : STD_LOGIC;
begin
	E1 : jk_with_polar_control port map (not_S, Q5, Bx, '1', not_R, Q1, not_Q1);
	E2 : jk_with_polar_control port map (not_S, Q1, Bx, Q6, not_R, Q2, not_Q2);
	E3 : jk_with_polar_control port map (not_S, Q7, Bx, Q7, not_R, Q3, not_Q3);
	E4 : jk_with_polar_control port map (not_S, Q8, Bx, Q2, not_R, Q4, not_Q4);	
	E5 : or_2 port map (not_Q4, not_Q2, Q5);
	E6 : or_2 port map (Q1, Q4, Q6);
	E7 : and_2 port map (Q1, Q2, Q7);
	E8 : and_3 port map (Q1, Q2, Q3, Q8);
	out_Q1 <= Q1;
	out_not_Q1 <= not_Q1;
	out_Q2 <= Q2;
	out_not_Q2 <= not_Q2;
	out_Q3 <= Q3;
	out_not_Q3 <= not_Q3;
	out_Q4 <= Q4;
	out_not_Q4 <= not_Q4;
end ct;
