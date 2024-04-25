library IEEE;
use IEEE.STD_LOGIC_1164.all;
entity jk_with_polar_control is
	port(
		not_S, J : inout STD_LOGIC;
		C : in STD_LOGIC;
		K : in STD_LOGIC;
		not_R : in STD_LOGIC;
		Q : out STD_LOGIC;
		not_Q : out STD_LOGIC
		);
end jk_with_polar_control;

architecture jk_with_polar_control of jk_with_polar_control is
	component and_3_no
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
	    	x3 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component or_3_no
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			x3 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component or_2_no
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component no
		port(
			x : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	sigNal Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, S, R : STD_LOGIC; 
	begin
		E1 : and_3_no port map (Q8, J, C, Q1);
		E2 : and_3_no port map (Q7, K, C, Q2);
		E3 : and_3_no port map (Q1, Q4, not_S, Q3);
		E4 : and_3_no port map (Q2, Q3, not_R, Q4);
		E5 : or_2_no port map (Q3, C, Q5);
		E6 : or_2_no port map (Q4, C, Q6);
		E7 : or_3_no port map (Q5, Q8, R, Q7);
		E8 : or_3_no port map (Q6, Q7, S, Q8);
		E9 : no port map (not_S, S);
		E10 : no port map (not_R, R);
		Q <= Q7;
		not_Q <= Q8;
end jk_with_polar_control;  

architecture jk_with_polar_control_2 of jk_with_polar_control is
	component and_3_no
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
	    	x3 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component or_3_no
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			x3 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component or_2_no
		port(
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	component no
		port(
			x : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	signal Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, S, R : STD_LOGIC; 
	begin
		E1 : and_3_no port map (Q8, J, C, Q1);
		E2 : and_3_no port map (Q7, K, C, Q2);
		E3 : and_3_no port map (Q1, Q4, not_S, Q3);
		E4 : and_3_no port map (Q2, Q3, not_R, Q4);
		E5 : or_2_no port map (Q3, C, Q5);
		E6 : or_2_no port map (Q4, C, Q6);
		E7 : or_3_no port map (Q5, Q8, R, Q7);
		E8 : or_3_no port map (Q6, Q7, S, Q8);
		E9 : no port map (not_S, S);
		E10 : no port map (not_R, R);
		Q <= Q7;
		not_Q <= Q8;
end jk_with_polar_control;
