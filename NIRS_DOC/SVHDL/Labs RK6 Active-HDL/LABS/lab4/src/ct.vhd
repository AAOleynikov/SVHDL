library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity ct is
	generic (
		bitrate : integer := 4
	);
	port (
		Bx : in	STD_LOGIC;
		not_R : in STD_LOGIC;
		out_Q : out STD_LOGIC_VECTOR(bitrate-1 downto 0);
		out_not_Q : out STD_LOGIC_VECTOR(bitrate-1 downto 0)
	);
end ct;

architecture ct of ct is
	component jk_with_polar_control
		port (
			not_S : in STD_LOGIC;
			J : in STD_LOGIC;
			C : in STD_LOGIC;
			K : in STD_LOGIC;
			not_R : in STD_LOGIC;
			Q : out STD_LOGIC;
			not_Q : out STD_LOGIC
		);
	end component;
	component and_2
		port (
			x1 : in STD_LOGIC;
			x2 : in STD_LOGIC;
			y : out STD_LOGIC
		);
	end component;
	signal Q, not_Q : STD_LOGIC_VECTOR(bitrate-1 downto 0);
	signal ands : STD_LOGIC_VECTOR(bitrate-1 downto 0);
begin
	ands(0) <= '1';
	E1 : jk_with_polar_control port map ('1', '1', Bx, '1', not_R, Q(0), not_Q(0));
	triggers : for i in 1 to bitrate-1 generate
		E_and : and_2 port map (ands(i-1), Q(i-1), ands(i));
		E : jk_with_polar_control port map ('1', ands(i), Bx, ands(i), not_R, Q(i), not_Q(i));
	end generate triggers;
	out_Q <= Q;
	out_not_Q <= not_Q;
end ct;
