library IEEE;
use IEEE.STD_LOGIC_1164.all;

eNtity jk_with_forbidden_links is
	 port(
		 not_S, J : in STD_LOGIC;
		 C : in STD_LOGIC;
		 K : in STD_LOGIC;
		 not_R : in STD_LOGIC;
		 Q : out STD_LOGIC;
		 not_Q : out STD_LOGIC
	     );	
end jk_with_forbidden_links;

architecture jk_with_forbidden_links of jk_WitH_forbidden_links is
	component and_3_no
	 	port(
		 	x1 : in STD_LOGIC;
		 	x2 : in STD_LOGIC;
		 	x3 : in STD_LOGIC;
		 	y : out STD_LOGIC
	     	);
	end component;
	signal Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8 : STD_LOGIC; 
begin
		E1 : and_3_no port map (Q8, J, C, Q1);
		E2 : and_3_no port map (Q7, K, C, Q2);
		E3 : and_3_no port map (Q1, Q4, not_S, Q3);
		E4 : and_3_no port map (Q2, Q3, not_R, Q4);
		E5 : and_3_no port map (Q1, Q2, Q3, Q5);
		E6 : and_3_no port map (Q1, Q2, Q4, Q6);
		E7 : and_3_no port map (Q5, Q8, not_S, Q7);
		E8 : and_3_no port map (Q6, Q7, not_R, Q8);	
		Q <= Q7;
		not_Q <= Q8;
end jk_with_forbidden_links;